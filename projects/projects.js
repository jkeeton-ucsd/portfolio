import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
 
const projects = await fetchJSON('../lib/projects.json');
 
const projectsContainer = document.querySelector('.projects');
 
renderProjects(projects, projectsContainer, 'h2');

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let sliceGenerator = d3.pie().value((d) => d.value);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let svg = d3.select('svg');
let legend = d3.select('.legend');

let query = '';
let selectedYear = null;

function getSearchResults() {
  return projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query.toLowerCase());
  });
}

// Both filters live here, so a search and a wedge click always combine
function renderVisibleProjects() {
  let visibleProjects = getSearchResults();

  if (selectedYear !== null) {
    visibleProjects = visibleProjects.filter((project) => project.year === selectedYear);
  }

  renderProjects(visibleProjects, projectsContainer, 'h2');
}

function renderPieChart(projectsGiven) {
  // re-calculate rolled data
  let rolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );

  // re-calculate data
  let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // re-calculate arc data and arcs
  let arcData = sliceGenerator(data);
  let arcs = arcData.map((d) => arcGenerator(d));

  // clear up paths and legends
  svg.selectAll('path').remove();
  legend.selectAll('li').remove();

  // update paths and legends
  arcs.forEach((arc, i) => {
    let year = data[i].label;

    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .classed('selected', year === selectedYear)
      .on('click', () => {
        selectedYear = selectedYear === year ? null : year;

        svg.selectAll('path').classed('selected', (_, idx) => data[idx].label === selectedYear);
        legend.selectAll('li').classed('selected', (_, idx) => data[idx].label === selectedYear);

        renderVisibleProjects();
      });
  });

  data.forEach((d, idx) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(idx)}`)
      .attr('class', 'legend-item')
      .classed('selected', d.label === selectedYear)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Call this function on page load
renderPieChart(projects);

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  // update query value
  query = event.target.value;

  let searchResults = getSearchResults();

  // drop the selection if the search removed that year's wedge
  if (!searchResults.some((project) => project.year === selectedYear)) {
    selectedYear = null;
  }

  // the pie shows search results, the cards also respect the selected year
  renderVisibleProjects();
  renderPieChart(searchResults);
});

const projectsTitle = document.querySelector('.projects-title');
 
if (projectsTitle && Array.isArray(projects)) {
  projectsTitle.textContent = `${projects.length} Projects`;
}