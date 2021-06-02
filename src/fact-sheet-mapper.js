import escape from 'lodash/escape';

export default function factSheetMapper(item) {
  const displayName = item.attributes.displayName;
  const description = item.attributes.description;

  return `
    <h6 style="background: ${item.color.background}; color: ${item.color.color}">${displayName}</h6>
    <div style="font-size: 11px">${escape(description)}</div>
  `;
}
