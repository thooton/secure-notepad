defmodule SecureNotepadServer.Argon2w do
  @salt_length 32

  use Agent

  def start_link(_) do
    %{
      "memory_use_mb" => memory_use_mb,
      "threads" => threads,
      "passes" => passes
    } = SecureNotepadServer.Options.get()["argon2_options"]

    options = [
      t_cost: passes |> try_parse_int,
      m_cost: ((memory_use_mb |> try_parse_int) * 1024) |> :math.log2 |> floor,
      parallelism: threads |> try_parse_int,
      argon2_type: 2 # argon2id
    ]
    Agent.start_link(fn -> options end, name: __MODULE__)
  end

  defp value do
    Agent.get(__MODULE__, & &1)
  end

  def hash(password) do
    options = value() ++ [salt_len: @salt_length]
    Argon2.hash_pwd_salt(password, options)
  end

  def verify(guess, hash) do
    Argon2.verify_pass(guess, hash)
  end

  def salt do
    :crypto.strong_rand_bytes(@salt_length)
  end

  def hash_raw(password, salt, byte_len \\ 32) do
    options = value() ++ [hash_len: byte_len, format: :raw_hash]
    Argon2.Base.hash_password(password, salt, options)
    |> Base.decode16!(case: :lower)
  end

  def try_parse_int(val) do
    try do
      String.to_integer(val)
    rescue
      _ -> val
    end
  end
end
