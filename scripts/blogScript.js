$(function () {
  console.log("Blog Script Loaded");

  let posts = []; // store posts in memory to allow edits/deletes

  // load posts from external JSON file
  async function loadPosts() {
    try {
      const response = await fetch("https://pittsoccer.github.io/DevBlogData/posts.json");
      const data = await response.json();

      // BONUS #1: Sort Function
      // sort posts by date posted, newest first
      posts = data.posts.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));

      displayPosts(posts);
    } catch (error) {
      console.error("ERROR: could not fetch blog posts", error);
    }
  }

  // display blog posts 
  function displayPosts(posts) {
    const container = $("#dev-blog-container").empty();
    posts.forEach((post, index) => container.append(postCardHtml(post, index)));
  }

  // generate HTML for a single post card
  function postCardHtml(post, index) {
    return `
    <div class="card mb-3" data-index="${index}">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start">
          <h5 class="card-title mb-0">${escapeHtml(post.title)}</h5>
          <div>
            <button class="btn btn-sm btn-primary edit-post">Edit</button>
            <button class="btn btn-sm btn-danger delete-post">Delete</button>
          </div>
        </div>
        <p class="card-text mt-2">${escapeHtml(post.post)}</p>
        <p class="card-text"><small class="text-muted">${post.datePosted}</small></p>
      </div>
    </div>
  `;
  }

  // escape HTML to prevent injection when rendering user content
  function escapeHtml(text) {
    return $('<div>').text(text).html();
  }

  // BONUS #2: Search Function
  // filter posts based on search input
  $("#searchInput").on("input", function () {
    const searchTerm = $(this).val().toLowerCase();
    $("#dev-blog-container .card").each(function () {
      const title = $(this).find(".card-title").text().toLowerCase();
      $(this).toggle(title.includes(searchTerm));
    });
  });

  // add new blog post 
  $("#addPostForm").on("submit", function (e) {
    e.preventDefault();

    const title = $("#postTitle").val().trim();
    const content = $("#postContent").val().trim();
    const date = $("#postDate").val() || new Date().toISOString().split("T")[0];

    if (title && content) {
      const newPost = { title, post: content, datePosted: date };
      // add to posts array at start
      posts.unshift(newPost);

      displayPosts(posts);

      // BONUS #3: BS5 Toast
      const toastElement = document.getElementById('toastSuccess');
      if (toastElement) {
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
      }

      // BONUS #4: BS5 Modal
      // reset form and hide modal
      $("#addPostModal").modal("hide");
      this.reset();
    }
  });

  // edit & delete posts
  $("#dev-blog-container").on("click", ".edit-post", function () {
    const card = $(this).closest(".card");
    const index = card.data("index");
    const post = posts[index];

    // replace display with editable inputs
    card.find(".card-body").html(`
      <div class="mb-2">
        <input type="text" class="form-control edit-title" value="${escapeHtml(post.title)}" />
      </div>
      <div class="mb-2">
        <textarea class="form-control edit-post-text" rows="4">${escapeHtml(post.post)}</textarea>
      </div>
      <p class="card-text"><small class="text-muted">${post.datePosted}</small></p>
      <button class="btn btn-sm btn-success save-post">Save</button>
      <button class="btn btn-sm btn-secondary cancel-edit">Cancel</button>
    `);
  });

  $("#dev-blog-container").on("click", ".delete-post", function () {
    const card = $(this).closest(".card");
    const index = card.data("index");

    if (confirm("Are you sure you want to delete this post?")) {
      posts.splice(index, 1); // Remove from array
      displayPosts(posts);
    }
  });

  $("#dev-blog-container").on("click", ".save-post", function () {
    const card = $(this).closest(".card");
    const index = card.data("index");

    const newTitle = card.find(".edit-title").val().trim();
    const newPostText = card.find(".edit-post-text").val().trim();

    if (!newTitle || !newPostText) {
      alert("Title and post content cannot be empty.");
      return;
    }

    // update post in array
    posts[index].title = newTitle;
    posts[index].post = newPostText;

    // re-render posts
    displayPosts(posts);
  });

  $("#dev-blog-container").on("click", ".cancel-edit", function () {
    displayPosts(posts);
  });

  // initial load
  loadPosts();
});
