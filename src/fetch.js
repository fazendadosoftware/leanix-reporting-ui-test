import memoizeOne from "memoize-one";
import isEqual from 'lodash/isEqual';

function fetchFactSheets(attributes, filters) {
  const today = new Date().toISOString();
  const pointOfView = { id: 'current', changeSet: { type: 'dateOnly', date: today } };

  return lx.getProjections(attributes, filters, [pointOfView])
    .then(({ data }) => {
      return data[0]?.items || []
    });
}

export default fetch = memoizeOne(fetchFactSheets, isEqual);