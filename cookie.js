struct = restruct.
    int32lu('chip').
    int32lu('pad1').
    int32lu('timestamp').
    int32lu('pad2').
    string('uuid', 16).
    string('sig', 16);

struct_sig = restruct.
    int32lu('chip').
    int32lu('pad1').
    int32lu('timestamp').
    int32lu('pad2').
    string('uuid', 16);

function CookieDescriptor(chip, seed) {
    this.chip = chip;
    this.seed = seed;

    this.generateCookie = function() {
	return new Cookie(this.chip, this.seed);
    }
}

function Cookie(chip, seed) {
    this.chip = chip;
    this.seed = seed;
    this.timestamp = Math.floor(Date.now() / 1000);
    this.uuid = Math.uuid();

    var str = this.chip + "," + this.timestamp + "," + this.uuid;
    
    this.sig = asmCrypto.HMAC_SHA1.hex(this.seed, str);
    
    this.toBytes = function() {
	
	vals =  struct.pack({chip:this.chip, timestamp:this.timestamp,
			    uuid:this.uuid, sig:this.sig});
	_data = new ArrayBuffer(vals.length);
	for (var i = 0; i < vals.length; i++) {
	    _data[i] = vals[i];
	}
	data = new Uint8Array(_data);
	return data;
    }
    this.toString = function() {
	var str = this.chip + "," + this.timestamp + "," + this.uuid + "," + this.sig;
	console.log(str);
	str = btoa(str);
	return str;
    }
}
