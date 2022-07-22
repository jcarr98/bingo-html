// Playlist info
let playlistName, playlistId;
// List of all track names
// We don't need to use the Track class because we are only storing names
let tracks = [];

function load() {
  loadSettings();
  let valid = validateUser(); 
  if(valid) {
    loadTracks();
  } else {
    window.location.replace('/login');
  }
}

function loadTracks() {
  // Get playlist ID from URL parameters
  const params = new URLSearchParams(location.search);
  playlistName = params.get('name');
  playlistId = params.get('id');

  // Update playlist name area
  let playlistNameArea = document.getElementById('playlistName');
  playlistNameArea.value = playlistName;

  getTracks(playlistId)
  .then(result => {
    if(!result.success) {
      window.location.replace('/login');
      return;
    }

    // Pull only names from tracks
    for(const track of result.tracks) {
      tracks.push(track.name);
    }

    // Update facts for user
    let totalTracks = document.getElementById('totalTracks');
    totalTracks.innerHTML = tracks.length;
    let possibleSheets = document.getElementById('possibleSheets');
    possibleSheets.innerHTML = factorial(tracks.length);

    // Create track for each item
    let trackList = document.getElementById('trackList');
    trackList.innerHTML = '';
    for(let i = 0; i < tracks.length; i++) {
      let ti = createTrack(tracks[i], i);

      trackList.appendChild(ti);
    }
  });
}

function createTrack(track, index) {
  // Create track container
  let trackContainer = document.createElement('div');
  trackContainer.classList.add('box');
  trackContainer.classList.add('box-full');
  trackContainer.classList.add('box-small');

  // Create track item
  let trackItem = document.createElement('input');
  trackItem.id = `track${index}`;
  trackItem.value = track;
  trackItem.classList.add('input');

  // Add track item to container
  trackContainer.appendChild(trackItem);

  return trackContainer;
}

function factorial(n) {
  function factorialHelper(n) {
    if(n === 0) {
      return 1;
    } else {
      return n * factorialHelper(n-1);
    }
  }

  return factorialHelper(n);
}

function go() {
  // Show loading modal
  let modal = document.getElementById('loadingModal');
  modal.style.display = 'block';

  // Generate tables and gather all relevant information
  setTimeout(generate, 500);  // Timeout allows modal time to show before generate slows down page
}

function generate() {
  // Show loading modal
  let modal = document.getElementById('loadingModal');
  modal.style.display = 'block';

  // Collect playlist title
  let title = document.getElementById('playlistName').value;
  if(title.split(' ').join('').length < 1) {
    alert('Playlist title must be at least one letter');
    return;
  }

  // Collect track names
  let trackNames = [];
  for(let i = 0; i < tracks.length; i++) {
    let track = document.getElementById(`track${i}`).value;
    if(track.split(' ').join('').length < 1) {
      alert('At least one track is missing a name');
      return;
    } else {
      trackNames.push(track);
    }
  }

  // Get number of sheets
  const numSheets = parseInt(document.getElementById('numSheets').value);

  // Create tables
  const tables = generateTables(trackNames, numSheets);

  // Confirm sheet creation was successful
  if(tables.length < numSheets) {
    console.log('Error generating sheets, not enough created');
    return;
  }

  // Get company name
  let company = document.getElementById('companyName').value;
  if(company.split(' ').join('').length < 1) {
    company = null;
  }

  // Get freespace image and create PDF
  if(freespace.files.length > 0) {
    let reader = new FileReader();
    reader.onload = function(e) {
      createPDF(title, company, e.target.result, tables);
    };
    reader.readAsDataURL(freespace.files[0]);
  } else {
    createPDF(title, company, null, tables);
  }
}

/* This is bad, but does the job */
// Shuffle array of songs and compare to already shuffled songs.
// If the array is unique, save it; if not, skip
const generateTables = (arr, k) => {
  let results = [];

  // Returns shuffled array
  const shuffle = (array) => {
    let shuffled = array.slice();
    let currentIndex = shuffled.length, randomIndex;
    while(currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
    }

    return shuffled;
  };

  // Compares array to existing arrays
  const compare = (newArray, allArrays) => {
    let nJson = JSON.stringify(newArray);

    for(let i = 0; i < allArrays.length; i++) {
      let aJson = JSON.stringify(allArrays[i]);

      if(nJson === aJson) {
        console.log('New board already exists');
        return false;
      }
    }

    return true;
  };

  const splitArray = (array) => {
    let table = [];
    let middleRow = [];

    // Split current table into 5 rows
    table.push(array.slice(0, 5));
    table.push(array.slice(5, 10));

    // In third row we need 'Free Space'
    middleRow = array.slice(10, 12);
    middleRow.push('');  // Leave free space blank - gets filled in by PDF generator
    middleRow.push(array[13], array[14]);
    table.push(middleRow);

    table.push(array.slice(15, 20));
    table.push(array.slice(20));

    return table;
  }

  let nArr = arr;
  let i = 0;
  let repeats = 0;
  while(i < k && repeats < 50) {
    nArr = shuffle(nArr);
    // Only take first 25 songs
    let shuffledArr = splitArray(nArr.slice(0, 25));
    // Check if this table is already saved
    if(compare(shuffledArr, results)) {
      // Create table using first 25 songs
      // let table = splitArray(shuffledArr);
      results.push(shuffledArr);
      i++;
    } else {
      console.log('Repeat sheet generated, skipping');
      repeats++;
    }
  }

  if(repeats >= 50) {
    console.log('Error generating sheets, too many repeats');
    return [];
  }

  return results;
}

function createPDF(title, company, freespace, tables) {
  const pdf = new jspdf.jsPDF();

    const pageWidth = pdf.internal.pageSize.getWidth();

    // For each bingo sheet, create a new page in the pdf
    for(let i = 0; i < tables.length; i++) {
      // If company logo is provided, add to PDF
      if(company !== null) {
        pdf.setFontSize(10);
        pdf.text(company, 10, 10);
      }

      pdf.setFontSize(32);
      pdf.text(title, pageWidth/2, 35, 'center');
      pdf.autoTable({
        startY: 60,
        headStyles: {
          lineWidth: 0,
          minCellHeight: 5,
          textColor: 'black',
          fontSize: 22,
          fontStyle: 'bold'
        },
        styles: {
          cellWidth: pageWidth/5-5,
          minCellHeight: pageWidth/5-5,
          halign: 'center',
          valign: 'middle',
          overflow: 'linebreak',
          fillColor: false,
          lineWidth: 0.5
        },
        alternateRowStyles: {
          fillColor: false
        },
        head: [['B', 'I', 'N', 'G', 'O']],
        body: tables[i],
        didDrawCell: function(data) {
          if(data.column.index === 2 && data.row.index === 2) {
            let dim = data.cell.height - data.cell.padding('vertical');
            let textPos = data.cell.getTextPos();
            // Free space image
            if(freespace !== null) {
              pdf.addImage(freespace, 'png', textPos.x-17, textPos.y-17, dim, dim);
            } else {
              pdf.setFont(undefined, 'bold');
              pdf.text(textPos.x-9, textPos.y+1, 'Free Space');
              pdf.setFont(undefined, 'normal');
            }
          }
        }
      });
      
      if(i < tables.length-1) {
        pdf.addPage();
      }
    }

    pdf.save(`${title} Bingo Sheets.pdf`);
    window.location.href = '/';
}