import Config

config :secure_notepad_server,
  ecto_repos: [SecureNotepadServer.Database.Repo]

config :hammer,
  backend: {Hammer.Backend.ETS,
            [expiry_ms: 60_000 * 60 * 4,
             cleanup_interval_ms: 60_000 * 10]}
