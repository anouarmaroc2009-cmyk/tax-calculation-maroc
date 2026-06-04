const API = '/api';

async function post(path: string, data: any) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  is: { calculate: (d: any) => post('/is/calculate', d) },
  ir: { calculate: (d: any) => post('/ir/calculate', d) },
  tva: { calculate: (d: any) => post('/tva/calculate', d) },
  classification: { classify: (type: string, context: any) => post('/classification/classify', { type, context }) },
  optimization: { run: (d: any) => post('/optimization/run', d) },
  penalties: { calculate: (d: any) => post('/penalties/calculate', d) },
};
