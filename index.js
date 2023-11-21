import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // GitHub tokeninizi buraya girin
});

const REPO_OWNER = "facebook"; // Repository sahibinin adı
const REPO_NAME = "react"; // Repository adı

// Son sayfa numarasını bulmak için fonksiyon
async function findLastPage(owner, repo) {
  let page = 1;
  let lastPage = false;

  while (!lastPage) {
    try {
      const response = await octokit.repos.listCommits({
        owner: owner,
        repo: repo,
        per_page: 1,
        page: page,
      });

      if (response.headers.link) {
        const links = response.headers.link
          .split(",")
          .map((a) => a.split(";").map((b) => b.trim()));
        const lastLink = links.find((link) => link[1] === 'rel="last"');
        if (lastLink) {
          const lastPageUrl = new URL(lastLink[0].slice(1, -1));
          page = parseInt(lastPageUrl.searchParams.get("page"));
          lastPage = true;
        }
      } else {
        lastPage = true;
      }
    } catch (error) {
      console.error("Hata bulunan sayfada:", error);
      throw error;
    }
  }

  return page;
}

// İlk commiti bulmak için fonksiyon
async function findFirstCommit(owner, repo) {
  try {
    const lastPageNumber = await findLastPage(owner, repo);
    const finalCommits = await octokit.repos.listCommits({
      owner: owner,
      repo: repo,
      per_page: 1,
      page: lastPageNumber,
    });

    return finalCommits.data[0]; // İlk commit
  } catch (error) {
    console.error("Hata ilk commiti alırken:", error);
    throw error;
  }
}

findFirstCommit(REPO_OWNER, REPO_NAME)
  .then((commit) => {
    return console.log("İlk Commit:", commit);
  })
  .catch((error) => {
    return console.error("Hata:", error);
  });
