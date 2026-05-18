<?php

namespace Database\Seeders;

use App\Models\Note;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class NoteSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::where('email', 'test@example.com')->first();

        if (!$user) {
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => Hash::make('password'),
            ]);
        }

        if ($user->notes()->count() === 0) {
            $this->seedTestUserNotes($user);
        }
    }


    private function seedTestUserNotes(User $user): void
    {
        $notes = [
            [
                'title' => 'Welcome to Aito-Note!',
                'body' => "Welcome to your personal dashboard! Aito-Note is a clean, secure, and lightning-fast note-taking application built with Laravel and React.\n\nHere are a few things you can do:\n• Create new notes using the \"New Note\" button.\n• Edit, update, and search notes instantly.\n• Organize your life, ideas, and work efficiently.",
            ],
            [
                'title' => 'Weekly Shopping List',
                'body' => "Don't forget to grab these items from the grocery store:\n- 🍎 Organic Gala Apples\n- 🥛 Unsweetened Almond Milk\n- 🍞 Freshly Baked Sourdough Bread\n- 🥑 Avocados & Cherry Tomatoes\n- ☕ Single-origin Coffee Beans\n- 🍫 Dark Chocolate (85% Cocoa)",
            ],
            [
                'title' => 'Awesome Project Ideas',
                'body' => "Here are some side project ideas to build next:\n\n1. Personal Finance Tracker: A minimalist web app to log expenses using Chart.js or Recharts.\n2. Recipe Curator: Scraping favorite cooking websites and converting them into neat clean Markdown formats.\n3. Weather Dashboard: An interactive app featuring real-time animations based on local weather conditions.",
            ],
            [
                'title' => 'Daily Workout Routine',
                'body' => "Time to stay active! Warm up well before starting:\n\n- 🏃 10 mins Light Cardio / Dynamic Stretching\n- 🏋️ 4 sets x 10 reps - Barbell Squats\n- 💪 3 sets x 12 reps - Push-ups / Bench Press\n- 🤸 3 sets x 15 reps - Kettlebell Swings\n- 🧘 5 mins Deep Breathing & Static Cool-down Stretching",
            ],
            [
                'title' => 'Quick Thoughts & Quotes',
                'body' => "\"Simplicity is the ultimate sophistication.\" — Leonardo da Vinci\n\nMust remember to keep the codebase clean, components highly cohesive, and the user interface delightfully premium.",
            ],
        ];

        foreach ($notes as $note) {
            Note::create([
                'user_id' => $user->id,
                'title' => $note['title'],
                'body' => $note['body'],
            ]);
        }
    }
}
