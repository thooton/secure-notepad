defmodule SecureNotepadServer.Endpoint do
  alias SecureNotepadServer.Hybrid
  alias SecureNotepadServer.Database.Queries
  alias SecureNotepadServer.Argon2w
  alias SecureNotepadServer.Database.User
  use Plug.Router

  plug RemoteIp,
    headers: {SecureNotepadServer.Options, :remoteip_headers, []}

  plug Replug,
    plug: Hammer.Plug,
    opts: {SecureNotepadServer.Options, :ratelimit_options}

  plug(:match)

  plug(Plug.Parsers,
    parsers: [:json],
    pass: ["application/json"],
    json_decoder: Poison
  )

  plug(:dispatch)

  get "/getkey" do
    resp_json(%{
      "key" => Hybrid.exp_public
    }, conn)
  end

  post "/register" do
    %{"username" => username, "password" => password}
      = get_enc_body(conn)

    if Queries.check_exists(username) do
      resp_error("Username already exists", conn)
    else
      Queries.create_user(username, Argon2w.hash(password), nil, Argon2w.salt())
      resp_success(conn)
    end
  end

  post "/login" do
    %{"username" => username, "password" => password,
      "public_key" => public_key, "enhanced_security" => enhanced_security}
      = get_enc_body(conn)

    case validate_and_get_entry(username, password) do
      {:ok, %User{notes: notes_enc, note_salt: note_salt}} ->
        if notes_enc != nil do
          aes_key = Argon2w.hash_raw(password, note_salt)
          notes = Hybrid.decrypt_aes(notes_enc, aes_key)
          Hybrid.encrypt(%{"success" => true, "notes" => notes}, public_key, enhanced_security)
          |> resp_json(conn)
        else
          resp_success(conn)
        end
      {:err, error} ->
        resp_error(error, conn)
    end
  end

  defp validate_and_get_entry(username, password) do
    case Queries.get_user(username) do
      nil ->
        {:err, "Account not found"}
      entry = %User{password: hashed_password} ->
        if Argon2w.verify(password, hashed_password) do
          {:ok, entry}
        else
          {:err, "Incorrect password"}
        end
    end
  end

  post "/save" do
    %{"username" => username, "password" => password_enc,
      "notes" => notes}
      = get_enc_body(conn)
    password = password_enc |> Hybrid.decrypt(false)
    case validate_and_get_entry(username, password) do
      {:ok, %User{note_salt: note_salt}} ->
        aes_key = Argon2w.hash_raw(password, note_salt)
        notes_enc = notes |> Poison.encode! |> Hybrid.encrypt_aes(aes_key)
        Queries.set_notes(username, notes_enc)
        resp_success(conn)
      {:err, error} ->
        resp_error(error, conn)
    end
  end

  match _ do
    path = conn.path_info
    path = if path == [], do: "index.html", else: path |> Path.join
    case SecureNotepadServer.Cacher.get_file(path) do
      {:ok, contents, mime} ->
        conn |> put_resp_content_type(mime) |> send_resp(200, contents)
      {:err, _} ->
        "404: Page not found"
        |> resp_error(conn, 404)
    end
  end

  defp get_enc_body(conn) do
    conn.body_params
    |> Hybrid.decrypt(true)
    |> Enum.into(%{}, fn {k, v} ->
      v = if is_binary(v), do: v |> String.trim, else: v
      {k, v}
    end)
  end

  defp resp_success(conn) do
    %{"success" => true} |> resp_json(conn)
  end

  defp resp_error(error, conn, status \\ 200) do
    %{"error" => error} |> resp_json(conn, status)
  end

  defp resp_json(map, conn, status \\ 200) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(status, Poison.encode!(map))
  end
end
