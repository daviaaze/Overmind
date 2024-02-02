{
  description = "lux-node-developer-environment";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    mypinned-nixpkgs.url = "github:NixOS/nixpkgs/cce0667703fce3a1162dd252cf0864fdf83466ab";
  };

  outputs = { self, flake-utils, mypinned-nixpkgs }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import mypinned-nixpkgs {
          inherit system;
        };
      in
      {
        # enables use of `nix shell`
        devShell = pkgs.mkShell {
          # add things you want in your shell here
          buildInputs = with pkgs; [
            nodejs-12_x
            (yarn.override { nodejs = nodejs-12_x; })
          ];
          shellHook = ''
            '';
        };
      }
    );
}
