import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // stored in .env, never in frontend
const OWNER = "pittsoccer";  // your GitHub username
const REPO = "DevBlogData";  // repo that has posts.json
const FILE_PATH = "posts.json";

// Helper: Get file SHA (needed for updating)
async function getFileSha() {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
    const res = await fetch(url, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
    });
    const data = await res.json();
    return data.sha;
}

// Update posts.json
app.post("/update-posts", async (req, res) => {
    try {
        const newPosts = req.body.posts; // frontend sends full updated posts array
        const sha = await getFileSha();

        const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: "Update blog posts",
                content: Buffer.from(JSON.stringify({ posts: newPosts }, null, 2)).toString("base64"),
                sha,
            }),
        });

        const data = await response.json();
        res.json({ success: true, data });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
