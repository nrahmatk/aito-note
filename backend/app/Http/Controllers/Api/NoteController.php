<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Note\StoreNoteRequest;
use App\Http\Requests\Note\UpdateNoteRequest;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class NoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $notes = $request->user()
            ->notes()
            ->latest()
            ->get();

        return NoteResource::collection($notes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreNoteRequest $request): NoteResource
    {
        $note = $request->user()->notes()->create($request->validated());

        return NoteResource::make($note);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Note $note): NoteResource
    {
        $this->abortWhenNoteBelongsToAnotherUser($request, $note);

        return NoteResource::make($note);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateNoteRequest $request, Note $note): NoteResource
    {
        $this->abortWhenNoteBelongsToAnotherUser($request, $note);

        $note->update($request->validated());

        return NoteResource::make($note);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Note $note): Response
    {
        $this->abortWhenNoteBelongsToAnotherUser($request, $note);

        $note->delete();

        return response()->noContent();
    }

    private function abortWhenNoteBelongsToAnotherUser(Request $request, Note $note): void
    {
        abort_if($note->user_id !== $request->user()->id, 404);
    }
}
