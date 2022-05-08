defmodule SecureNotepadServer.Database.Repo.Migrations.Users do
  use Ecto.Migration

  def change do
    create_if_not_exists table ("users") do
      add :username, :string, primary_key: true
      add :password, :string
      add :notes, :string
      add :note_salt, :binary
    end
  end
end
