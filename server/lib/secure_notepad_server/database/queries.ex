defmodule SecureNotepadServer.Database.Queries do
  import Ecto.Query, only: [from: 2]
  alias SecureNotepadServer.Database.User
  alias SecureNotepadServer.Database.Repo

  def get_user(username) do
    query = from u in User,
            where: u.username == ^username,
            select: u
    Repo.one(query)
  end

  def get_user_no_notes(username) do
    query = from u in User,
            where: u.username == ^username,
            select: [u.note_salt, u.password, u.username]
    Repo.one(query)
  end

  def check_exists(username) do
    query = from u in User,
            where: u.username == ^username,
            select: u.username
    Repo.one(query) != nil
  end

  def create_user(username, password, notes, note_salt) do
    Repo.insert!(%User {
      username: username,
      password: password,
      notes: notes,
      note_salt: note_salt
    })
  end

  def set_notes(username, notes) do
    query = from u in User,
            where: u.username == ^username,
            update: [set: [notes: ^notes]]
    Repo.update_all(query, [])
  end
end
