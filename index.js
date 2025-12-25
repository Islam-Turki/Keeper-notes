displayNotes();
displayTags();
updateOverview();

document.getElementById("addBtn").addEventListener("click", addNote);
document.getElementById("searchInput").addEventListener("input", filterNotes);

//  local storage

function getNotes() {
  let data = localStorage.getItem("notes");
  if (data === null) {
    return [];
  }
  return JSON.parse(data);
}

function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// add note

function addNote() {
  let title = document.getElementById("titleInput").value.trim();
  let content = document.getElementById("noteInput").value.trim();
  let tagsText = document.getElementById("tagsInput").value.trim();

  if (title === "" && content === "") return;

  let tagsArray = [];
  if (tagsText !== "") {
    tagsArray = tagsText.split(",");
  }

  let notes = getNotes();

  let note = {
    id: Date.now(),
    title: title,
    content: content,
    tags: tagsArray,
    created: new Date().toLocaleString(),
    edited: new Date().toLocaleString()
  };

  notes.push(note);
  saveNotes(notes);

  document.getElementById("titleInput").value = "";
  document.getElementById("noteInput").value = "";
  document.getElementById("tagsInput").value = "";

  displayNotes();
  displayTags();
  updateOverview();
}

//  display notes 

function displayNotes(filteredNotes = null) {
  let container = document.getElementById("notesContainer");
  if (!container) return;

  container.innerHTML = "";

  let notes = filteredNotes || getNotes();

  notes.forEach(note => {
    let div = document.createElement("div");
    div.className = "note";

    let tagsHTML = "";
    note.tags.forEach(tag => {
      tagsHTML += `<span class="tag">${tag}</span>`;
    });

    div.innerHTML = `
      <div class="note-header">
        <div class="note-title">${note.title}</div>
        <div class="note-buttons">
          <button onclick="editNote(${note.id})">✏️</button>
          <button onclick="deleteNote(${note.id})">🗑️</button>
        </div>
      </div>
      <p>${note.content}</p>
      <div class="tags">${tagsHTML}</div>
      <div class="note-date">
        Created: ${note.created}<br>
        Last edited: ${note.edited}
      </div>
    `;

    container.prepend(div);
  });
}

//  delete note

function deleteNote(id) {
  let notes = getNotes();
  let newNotes = [];

  notes.forEach(note => {
    if (note.id !== id) {
      newNotes.push(note);
    }
  });

  saveNotes(newNotes);
  displayNotes();
  displayTags();
  updateOverview();
}

// edit note

function editNote(id) {
  let notes = getNotes();
  let note = null;

  notes.forEach(n => {
    if (n.id === id) {
      note = n;
    }
  });

  if (note === null) return;

  let modal = document.getElementById("editModal");

  document.getElementById("editTitle").value = note.title;
  document.getElementById("editContent").value = note.content;
  document.getElementById("editTags").value = note.tags.join(",");

  modal.showModal();

  document.getElementById("saveEdit").onclick = function () {
    note.title = document.getElementById("editTitle").value.trim();
    note.content = document.getElementById("editContent").value.trim();
    let tagsText = document.getElementById("editTags").value.trim();

    if (tagsText === "") {
      note.tags = [];
    } else {
      note.tags = tagsText.split(",");
    }
    
    note.edited = new Date().toLocaleString();

    saveNotes(notes);
    modal.close();

    displayNotes();
    displayTags();
    updateOverview();
  };
}

// search 

function filterNotes() {
  let value = this.value.toLowerCase();
  let notes = getNotes();
  let result = [];

  notes.forEach(note => {
    if (
      note.title.toLowerCase().includes(value) ||
      note.content.toLowerCase().includes(value)
    ) {
      result.push(note);
    }
  });

  displayNotes(result);
}

// categories (Tags) 

function displayTags() {
  let tagListElement = document.getElementById("tagList");
  if (!tagListElement) return;

  let notes = getNotes();
  let allTags = [];

  notes.forEach(note => {
    note.tags.forEach(tag => {
      if (!allTags.includes(tag)) {
        allTags.push(tag);
      }
    });
  });

  tagListElement.innerHTML = "";

  allTags.forEach(tag => {
    let span = document.createElement("span");
    span.textContent = tag;

    span.onclick = function () {
      filterByTag(tag);
    };

    tagListElement.append(span);
  });
}

function filterByTag(tag) {
  let notes = getNotes();
  let result = [];

  notes.forEach(note => {
    if (note.tags.includes(tag)) {
      result.push(note);
    }
  });

  let container = document.getElementById("notesContainer");
  if (container) {
    displayNotes(result);
  }
}

//  overview 

function updateOverview() {
  let notes = getNotes();

  let totalNotes = document.getElementById("totalNotes");
  let totalTags = document.getElementById("totalTags");
  let lastEdited = document.getElementById("lastEdited");

  if (totalNotes) {
    totalNotes.textContent = notes.length;
  }

  if (totalTags) {
    let tags = [];
    notes.forEach(note => {
      note.tags.forEach(tag => {
        if (!tags.includes(tag)) {
          tags.push(tag);
        }
      });
    });
    totalTags.textContent = tags.length;
  }

  if (lastEdited) {
    if (notes.length === 0) {
      lastEdited.textContent = "-";
    } else {
      lastEdited.textContent = notes[notes.length - 1].edited;
    }
  }
}
