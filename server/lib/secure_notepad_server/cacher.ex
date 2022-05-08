defmodule SecureNotepadServer.Cacher do
  use Agent

  def start_link(_) do
    public =
      #Application.app_dir(:secure_notepad_server)
      File.cwd!
      |> Path.join("..")
      |> Path.join("public")
      |> Path.expand
    table = :ets.new(:file_cacher, [:set, :public])
    mime =
      :code.priv_dir(:secure_notepad_server)
      |> Path.join("mime.json")
      |> File.read!
      |> Poison.decode!
    Agent.start_link(fn -> {public, table, mime} end, name: __MODULE__)
  end

  defp state do
    Agent.get(__MODULE__, & &1)
  end

  def get_file(filename) do
    {public, table, _} = state()
    mime = get_mime(filename)
    filepath = public |> Path.join(filename) |> Path.expand
    if filepath |> String.starts_with?(public) do
      case :ets.lookup(table, filepath) do
        [] ->
          case File.read(filepath) do
            {:ok, contents} ->
              :ets.insert_new(table, {filepath, contents})
              {:ok, contents, mime}
            {:error, error} ->
              {:err, error}
          end
        [{_, contents}] ->
          {:ok, contents, mime}
      end
    else
      {:err, :eacces}
    end

  end

  defp get_mime(filename) do
    {_, _, mime_mappings} = state()
    extension = filename |> String.split(".") |> List.last("txt")
    mime_mappings[extension] || mime_mappings["txt"]
  end
end
