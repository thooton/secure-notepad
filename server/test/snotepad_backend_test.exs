defmodule SecureNotepadServerTest do
  use ExUnit.Case
  doctest SecureNotepadServer

  test "greets the world" do
    assert SecureNotepadServer.hello() == :world
  end
end
