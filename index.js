import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

// Step 2.1: show the first three projects
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = Array.isArray(projects) ? projects.slice(0, 3) : [];

const projectsContainer = document.querySelector('.projects');

// h3 because these cards sit under the "Latest Projects" <h2>
renderProjects(latestProjects, projectsContainer, 'h3');

// Step 3: GitHub profile stats
const githubData = await fetchGitHubData('jkeeton-ucsd');

const profileStats = document.querySelector('#profile-stats');

if (profileStats && githubData) {
  profileStats.innerHTML = `
    <h2>My GitHub Stats</h2>
    <dl>
      <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
      <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
      <dt>Followers</dt><dd>${githubData.followers}</dd>
      <dt>Following</dt><dd>${githubData.following}</dd>
    </dl>
  `;
} else if (profileStats) {
  profileStats.innerHTML = '<p>GitHub stats are unavailable right now.</p>';
}