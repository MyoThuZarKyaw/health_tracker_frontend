I. [v1.0]

I want to implemet React application called health tracker.

User Login:
As a user, he can login to the system so that to load activities and see the activity dashboard.

User Registration:
As a user, he can register into the system if he has no account.

Activity Logging:
As a user, he can log the activity - workouts, meals and steps
Each activity will have activity type and status. User can update the activity status.
User can see the activity dashboard.

For those functionality, I have implemented backend API already and have shared the apicollection as per attached - complete_activities_api_collections.json.

Can you help implement it using the react with vite and tailwind?

II. [v1.2]

- /api/activities/workout-choices/
Output:
{
    "workout_types": [
        {
            "value": "cardio",
            "label": "Cardio"
        },
        {
            "value": "strength",
            "label": "Strength"
        },
        {
            "value": "yoga",
            "label": "Yoga"
        },
        {
            "value": "pilates",
            "label": "Pilates"
        },
        {
            "value": "sports",
            "label": "Sports"
        },
        {
            "value": "other",
            "label": "Other"
        }
    ],
    "workout_statuses": [
        {
            "value": "planned",
            "label": "Planned"
        },
        {
            "value": "in_progress",
            "label": "In Progress"
        },
        {
            "value": "completed",
            "label": "Completed"
        },
        {
            "value": "cancelled",
            "label": "Cancelled"
        }
    ]
}

- /api/activities/meal-choices/
Output:
{
    "meal_types": [
        {
            "value": "breakfast",
            "label": "Breakfast"
        },
        {
            "value": "lunch",
            "label": "Lunch"
        },
        {
            "value": "dinner",
            "label": "Dinner"
        },
        {
            "value": "snack",
            "label": "Snack"
        }
    ],
    "meal_statuses": [
        {
            "value": "planned",
            "label": "Planned"
        },
        {
            "value": "consumed",
            "label": "Consumed"
        },
        {
            "value": "skipped",
            "label": "Skipped"
        }
    ]
}

- /api/activities/steps-choices/
Output:
{
    "steps_statuses": [
        {
            "value": "planned",
            "label": "Planned"
        },
        {
            "value": "in_progress",
            "label": "In Progress"
        },
        {
            "value": "completed",
            "label": "Completed"
        }
    ]
}

These are the choices api outputs, can you please help to modifiy the options based on those values.
