defmodule SecureNotepadServer.Database.Repo do
  use Ecto.Repo,
    otp_app: :secure_notepad_server,
    adapter: Ecto.Adapters.SQLite3

  def run_migrations do
    Ecto.Migrator.run(__MODULE__, migrations_path(), :up, all: true)
  end

  defp migrations_path do
    Path.join([:code.priv_dir(:secure_notepad_server), "repo", "migrations"])
  end
end
