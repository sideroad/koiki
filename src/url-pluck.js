import url from 'url';

export default function(str, targets) {
  const parsed = url.parse(str);
  return str ? targets.map(target => `${parsed[target] || ''}${target === 'protocol' ? '//' : ''}`).join('')
             : '';
}
