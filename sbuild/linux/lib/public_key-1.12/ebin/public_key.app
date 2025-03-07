{application, public_key,
  [{description, "Public key infrastructure"},
   {vsn, "1.12"},
   {modules, [	  public_key,
		  pubkey_pem,
		  pubkey_pbe,	
		  pubkey_ssh,
		  pubkey_cert,
		  pubkey_cert_records,
		  pubkey_crl,
                  pubkey_ocsp,
		  'OTP-PUB-KEY',
		  'PKCS-FRAME'
            ]},
   {applications, [asn1, crypto, kernel, stdlib]},
   {registered, []},
   {env, []},
   {runtime_dependencies, ["stdlib-3.5","kernel-3.0","erts-6.0","crypto-3.8",
			   "asn1-3.0"]}
   ]
}.

