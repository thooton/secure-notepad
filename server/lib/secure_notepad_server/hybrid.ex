defmodule SecureNotepadServer.Hybrid do
  use Agent

  def start_link(_) do
    {:ok, public_key, private_key} = Apoc.RSA.generate_key_pair(4096)
    state = {public_key, private_key}
    Agent.start_link(fn -> state end, name: __MODULE__)
  end

  defp state do
    Agent.get(__MODULE__, & &1)
  end

  def exp_public do
    {public_key, _} = state()
    Apoc.RSA.PublicKey.dump_pem(public_key)
  end

  def decrypt(request, json) do
    {_, private_key} = state()
    %{"key" => aes_key_enc, "data" => text_enc} = request

    {:ok, aes_key} = Apoc.RSA.PrivateKey.decrypt(private_key, aes_key_enc)
    #aes_key = Base.decode64!(aes_key_b64)

    {:ok, text} = Apoc.AES.decrypt(text_enc, aes_key)

    if json do
      Poison.decode!(text) |> Map.merge(%{"public_key" => request["public_key"]})
    else
      text
    end
  end

  def encrypt(data, public_key) do
    text = Poison.encode!(data)

    aes_key = :crypto.strong_rand_bytes(32)

    text_enc = Apoc.AES.encrypt(text, aes_key)

    #aes_key_b64 = Base.encode64(aes_key)

    {:ok, public_key} = Apoc.RSA.PublicKey.load_pem(public_key)

    aes_key_enc =
      :rsa
      |> :crypto.public_encrypt(aes_key, to_erlang_type(public_key), :rsa_pkcs1_oaep_padding)
      |> Apoc.encode()


    #{:ok, aes_key_enc} = Apoc.RSA.encrypt(public_key, aes_key_b64)

    %{
      "key" => aes_key_enc,
      "data" => text_enc
    }
  end

  def to_erlang_type(%Apoc.RSA.PublicKey{modulus: n, public_exponent: e}) do
    [e, n]
  end

  def encrypt_aes(text, key) do
    Apoc.AES.encrypt(text, key)
  end

  def decrypt_aes(text, key) do
    {:ok, result} = Apoc.AES.decrypt(text, key)
    result
  end
end
