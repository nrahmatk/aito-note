<?php

use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('note routes reject missing tokens', function () {
    $this->getJson('/api/notes')->assertUnauthorized();
    $this->postJson('/api/notes', ['title' => 'Draft'])->assertUnauthorized();
});

test('a user can create read update and delete notes', function () {
    $user = User::factory()->create();
    $token = $user->createToken('api-token')->plainTextToken;

    $createResponse = $this->withToken($token)
        ->postJson('/api/notes', [
            'title' => 'Launch checklist',
            'body' => 'Prepare the release notes.',
        ]);

    $createResponse
        ->assertCreated()
        ->assertJsonPath('data.title', 'Launch checklist')
        ->assertJsonPath('data.body', 'Prepare the release notes.');

    $noteId = $createResponse->json('data.id');

    $this->withToken($token)
        ->getJson('/api/notes')
        ->assertOk()
        ->assertJsonPath('data.0.id', $noteId);

    $this->withToken($token)
        ->getJson("/api/notes/{$noteId}")
        ->assertOk()
        ->assertJsonPath('data.title', 'Launch checklist');

    $this->withToken($token)
        ->putJson("/api/notes/{$noteId}", [
            'title' => 'Updated checklist',
            'body' => null,
        ])
        ->assertOk()
        ->assertJsonPath('data.title', 'Updated checklist')
        ->assertJsonPath('data.body', null);

    $this->withToken($token)
        ->deleteJson("/api/notes/{$noteId}")
        ->assertNoContent();

    $this->assertDatabaseMissing('notes', [
        'id' => $noteId,
    ]);
});

test('a user cannot access another users note', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $note = Note::factory()->for($owner)->create();
    $token = $otherUser->createToken('api-token')->plainTextToken;

    $this->withToken($token)
        ->getJson("/api/notes/{$note->id}")
        ->assertNotFound();
});
