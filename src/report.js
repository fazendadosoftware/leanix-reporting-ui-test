import { parseModels, computeViews, mapFacetSelectionToProjectionsFilters, mapViewSpecificationsToAttributes } from '@leanix/reporting-dimensions';
import factSheetMapper from './fact-sheet-mapper';
import fetch from './fetch';

const ID_VIEW_DROPDOWN = 'VIEW_DROPDOWN';

/**
 * The logic for our report is contained in this class.
 * We have create several functions to split up the logic, which increases maintainability.
 */
export class Report {
  constructor(setup) {
    this.setup = setup;
    this.settings = createSettings(setup);
  }

  /**
   * Creates a configuration object according to the reporting frameworks specification (see: TODO).
   */
  createConfig() {
    return {
      facets: [{ key: 'main', fixedFactSheetType: 'Application' }],
      ui: {
        elements: createElements(this.settings),
        timeline: createTimeline(),
        update: (selection) => this.handleSelection(selection)
      }
    };
  }

  handleSelection(selection) {
    this.settings = updateSettings(selection, this.settings);

    const filters = mapFacetSelectionToProjectionsFilters(
      selection.facets[0].state,
      this.setup.settings.dataModel,
      this.setup.settings.tagModel,
      this.setup.settings.currentUser
    );

    const attributes = [
      { name: 'displayName', type: 'field', field: 'displayName' },
      { name: 'type', type: 'field', field: 'type' },
      { name: 'description', type: 'field', field: 'description' },
      ...mapViewSpecificationsToAttributes([this.settings.view.active])
    ];

    fetch(attributes, filters)
      .then((data) => this.render(data));
  }

  render(data) {
    const { items, legend } = computeViews(data, this.settings.view.active.config);

    const html = items.map(factSheetMapper).join('');
    document.getElementById('report').innerHTML = html;

    lx.showLegend(getLegendItems(legend));
  }
}

function createSettings(setup) {
  const { views } = parseModels(
    'Application',
    setup.settings.dataModel,
    setup.settings.viewModel,
    setup.settings.translations,
    setup.settings.tagModel,
    setup.settings.factSheetPermissions
  );

  return {
    view: {
      active: views[0],
      options: views
    }
  };
}

function updateSettings(selection, settings) {
  const value = selection.elements.values[ID_VIEW_DROPDOWN];

  const active = settings.view.options.find((option) => option.config.attribute === value) || settings.view.options[0];
  return { view: { active, options: settings.view.options } };
}

function createElements(settings) {
  const dropdown = {
    id: ID_VIEW_DROPDOWN,
    type: 'dropdown',
    label: 'View',
    entries: settings.view.options.map((option) => ({
      id: option.config.attribute,
      label: option.name
    }))
  };
  const dropdownValue = settings.view.active.config.attribute;

  return {
    root: { items: [dropdown] },
    values: {
      [ID_VIEW_DROPDOWN]: dropdownValue
    }
  }
}

function createTimeline() {
  return undefined;
}

function getLegendItems(legend) {
  return legend.map(({ label, color }) => ({ label, bgColor: color.background }));
}