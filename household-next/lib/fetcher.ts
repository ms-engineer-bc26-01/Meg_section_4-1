// SWR 用の fetcher ユーティリティ (3-3〜3-5 要件)
export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error('Fetch error: ' + res.status);
    return res.json();
  });
