/**
 * Created by art on 2014-09-18.
 */
// Event handlers.........................................

var reader = new FileReader(),
    alignment = [];

var maxlen = 0;  // maximum sequence length


window.onload = function() {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	  // Great success! All the File APIs are supported.
	} else {
	  alert('The File APIs are not fully supported in this browser.');
	}

	// bind file browser to HTML5 FileReader
	$('#id_inputFile').on('change', function (e) {
    var files = e.target.files; // FileList object
	  var f = files[0];
    // TODO: check file MIME type, should be a plain text file
    reader.onload = fileReadComplete;
    reader.readAsText(f);
  });

};



function fileReadComplete (f) {
    /**
     * Parse FASTA from file contents
     */

    var contents = f.target.result,
        lines = contents.split(/\r\n|\r|\n/g),
        header = '',
        sequence = '';

    // parse FASTA file
    for (var line, i = 0; i < lines.length; i++) {
        line = lines[i];
        if (line[0] == '>') {
            if (sequence.length > 0) {
                alignment.push({'header': header, 'rawseq': sequence});
                if (sequence.length > maxlen) {
                    maxlen = sequence.length;
                }
                sequence = '';
            }
            header = line.slice(1);  // drop leading '>'
        } else {
            sequence += line.toUpperCase();
        }
    }
    // add last entry
    alignment.push({'header': header, 'rawseq': sequence});
    
    console.log(alignment);
}
