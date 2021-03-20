/**
 * Created by art on 2014-09-18.
 */
// Event handlers.........................................

var filename,
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
    let files = e.target.files,  // FileList object
        f = files[0];

    filename = f.name;
    // TODO: check file MIME type, should be a plain text file
    let reader = new FileReader();
    reader.readAsText(f);
    reader.onload = fileReadComplete;
  });

};


/**
 * Parse FASTA from file contents
 * @param f: ProgressEvent
 */

function fileReadComplete (f) {
  var contents = f.target.result,
      lines = contents.split(/\r\n|\r|\n/g),
      header = '',
      sequence = '';

  // parse FASTA file
  for (let line, i = 0; i < lines.length; i++) {
    line = lines[i];
    if (line[0] === '>') {
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

  // update partitions table
  // TODO: detect nucleotide/amino acid
  $("#tab-partitions tbody")
      .append(`<tr><td>${filename.split('.')[0]}</td><td>${filename}</td><td>${alignment.length}</td><td>${maxlen}</td><td>nucleotide</td><td>default</td><td>default</td><td>default</td></tr>`);

  // populate tips table
  for (let i = 0; i < alignment.length; i++) {
    
  }
}
