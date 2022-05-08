defmodule SecureNotepadServer.Database.User do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  schema "users" do
    field :username, :string, primary_key: true
    field :password, :string
    field :notes, :string
    field :note_salt, :binary
  end

  def changeset(user, params \\ %{}) do
    user
    |> cast(params, [:username, :password, :notes, :note_salt])
  end
end
