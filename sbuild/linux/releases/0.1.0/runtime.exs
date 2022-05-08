import Config

config :secure_notepad_server, SecureNotepadServer.Database.Repo,
  database: :code.priv_dir(:secure_notepad_server) |> Path.join("main.db")
