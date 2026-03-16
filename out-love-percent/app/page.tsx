'use client';

import { useState } from 'react';

const STROKES_DICTIONARY: { [key: string]: number } = {
  'ㄱ': 2, 'ㄴ': 2, 'ㄷ': 3, 'ㄹ': 5, 'ㅁ': 4, 'ㅂ': 4, 'ㅅ': 2, 'ㅇ': 1, 'ㅈ': 3, 'ㅊ': 4, 'ㅋ': 3, 'ㅌ': 4, 'ㅍ': 4, 'ㅎ': 3,
  'ㄲ': 4, 'ㄸ': 6, 'ㅃ': 8, 'ㅆ': 4, 'ㅉ': 6, 'ㅏ': 2, 'ㅑ': 3, 'ㅓ': 2, 'ㅕ': 3, 'ㅗ': 2, 'ㅛ': 3, 'ㅜ': 2, 'ㅠ': 3, 'ㅡ': 1, 'ㅣ': 1,
  'ㅘ': 4, 'ㅚ': 3, 'ㅙ': 5, 'ㅝ': 4, 'ㅞ': 5, 'ㅢ': 2, 'ㅐ': 3, 'ㅔ': 3, 'ㅟ': 3, 'ㅖ': 4, 'ㅒ': 4,
  'ㄳ': 4, 'ㄵ': 5, 'ㄶ': 5, 'ㄺ': 7, 'ㄻ': 9, 'ㄼ': 9, 'ㄽ': 7, 'ㄾ': 9, 'ㄿ': 9, 'ㅀ': 8, 'ㅄ': 6
};

const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const JUNG = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

export default function Home() {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'result'>('idle');
  const [combinedChars, setCombinedChars] = useState<string[]>([]);
  const [individualStrokes, setIndividualStrokes] = useState<number[]>([]);
  const [displaySteps, setDisplaySteps] = useState<number[][]>([]);

  const disassembleChar = (char: string): string[] => {
    const code = char.charCodeAt(0) - 44032;
    if (code < 0 || code > 11171) return [char];
    const res = [CHO[Math.floor(code / 588)], JUNG[Math.floor((code % 588) / 28)]];
    const jong = JONG[code % 28];
    if (jong) res.push(jong);
    return res;
  };

  const getStrokes = (charArray: string[], keepOriginal = false) => {
    let totalStrokes = 0;
    charArray.forEach(c => {
      if (c in STROKES_DICTIONARY) {
        totalStrokes += STROKES_DICTIONARY[c];
        if (!keepOriginal && totalStrokes >= 10) totalStrokes -= 10;
      }
    });
    return totalStrokes;
  };

  const calculateCompatibility = () => {
    if (!name1 || !name2) return alert("두 분의 이름을 모두 입력해주세요! 💕");
    setStatus('loading');

    setTimeout(() => {
      const combined: string[] = [];
      const maxLength = Math.max(name1.length, name2.length);
      for (let i = 0; i < maxLength; i++) {
        if (i < name1.length) combined.push(name1[i]);
        if (i < name2.length) combined.push(name2[i]);
      }
      setCombinedChars(combined);

      const individual = combined.map(char => getStrokes(disassembleChar(char), true));
      setIndividualStrokes(individual);

      let firstStep: number[] = [];
      for (let i = 0; i < combined.length - 1; i++) {
        const decomposedPair = [...disassembleChar(combined[i]), ...disassembleChar(combined[i+1])];
        firstStep.push(getStrokes(decomposedPair));
      }

      let steps: number[][] = [firstStep];
      let current = firstStep;
      while (current.length > 2) {
        let next: number[] = [];
        for (let i = 0; i < current.length - 1; i++) {
          let sum = (current[i] + current[i + 1]) % 10;
          next.push(sum);
        }
        steps.push(next);
        current = next;
      }
      setDisplaySteps(steps);
      setStatus('result');
    }, 1500);
  };

  const handleReset = () => {
    setName1(''); setName2(''); setCombinedChars([]); setIndividualStrokes([]); setDisplaySteps([]); setStatus('idle');
  };

  const finalScore = displaySteps.length > 0
      ? displaySteps[displaySteps.length - 1][0] * 10 + displaySteps[displaySteps.length - 1][1]
      : 0;

  return (
      <main className="min-h-screen bg-[#FFF0F3] flex flex-col items-center justify-center p-4 font-sans text-gray-800">

        {/* 입력 화면: 가로 배치 완벽 사수 */}
        {status === 'idle' && (
            <div className="w-full max-w-xl flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl font-extrabold text-[#FF85A1] mb-10 drop-shadow-sm">💕 우리 잘 될 수 있을까?</h1>
              <div className="w-full bg-white rounded-[40px] p-10 shadow-2xl shadow-pink-100 flex flex-col gap-10 border-4 border-white">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <input value={name1} onChange={(e) => setName1(e.target.value)} placeholder="상대 이름" className="w-full bg-[#FFF9FA] border-none rounded-2xl p-5 text-center text-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-pink-100 transition-all placeholder:text-pink-100" />
                  </div>
                  <div className="text-4xl animate-bounce text-pink-400 shrink-0 px-2">💗</div>
                  <div className="flex-1">
                    <input value={name2} onChange={(e) => setName2(e.target.value)} placeholder="내 이름" className="w-full bg-[#FFF9FA] border-none rounded-2xl p-5 text-center text-xl font-bold text-gray-700 outline-none focus:ring-4 focus:ring-pink-100 transition-all placeholder:text-pink-100" />
                  </div>
                </div>
                <button onClick={calculateCompatibility} className="w-full bg-[#FF85A1] hover:bg-[#FF6B8E] text-white font-bold py-5 rounded-2xl shadow-lg hover:shadow-pink-200 transition-all active:scale-95 text-xl">운명의 결과 확인하기 ✨</button>
              </div>
            </div>
        )}

        {status === 'loading' && (
            <div className="flex flex-col items-center animate-pulse gap-6">
              <div className="text-8xl">💖</div>
              <p className="text-[#FF85A1] text-2xl font-bold tracking-tighter">운명을 분석하는 중...</p>
            </div>
        )}

        {/* 결과 화면: 정렬 보강 */}
        {status === 'result' && (
            <div className="w-full max-w-2xl bg-white rounded-[40px] p-10 shadow-2xl shadow-pink-100 flex flex-col items-center border-4 border-white animate-in zoom-in duration-500">
              <h2 className="text-xl font-black text-gray-300 mb-8 tracking-[0.3em] uppercase">Result</h2>

              <div className="flex flex-col items-center w-full overflow-x-auto pb-4 custom-scrollbar">
                {/* 1. 이름 행 */}
                <div className="flex gap-4 mb-2 h-10 items-center justify-center">
                  {combinedChars.map((n, idx) => (
                      <div key={idx} className="w-10 text-center font-black text-xl text-[#FF85A1] shrink-0">{n}</div>
                  ))}
                </div>

                {/* 2. 개별 획수 행: 이름 바로 아래에 밀착 */}
                <div className="flex gap-4 mb-8 items-center justify-center">
                  {individualStrokes.map((s, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-pink-50 text-pink-300 shrink-0 border border-pink-100/50">
                        {s}
                      </div>
                  ))}
                </div>

                {/* 3. 피라미드 본체: 간격 및 선 정렬 */}
                <div className="flex flex-col items-center space-y-4">
                  {displaySteps.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex gap-4 relative items-center justify-center h-10">
                        {row.map((num, idx) => (
                            <div key={idx} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 relative transition-transform
                              ${rowIndex === displaySteps.length - 1 ? 'bg-[#FF85A1] text-white scale-125 shadow-lg shadow-pink-200' : 'bg-[#FFF9FA] text-pink-400 border border-pink-50'}
                            `}>
                              {num}
                              {rowIndex < displaySteps.length - 1 && (
                                  <>
                                    <div className="absolute top-[38px] left-[32px] w-[1px] h-[20px] bg-pink-100/60 rotate-[28deg] origin-top" />
                                    <div className="absolute top-[38px] left-[7px] w-[1px] h-[20px] bg-pink-100/60 -rotate-[28deg] origin-top" />
                                  </>
                              )}
                            </div>
                        ))}
                      </div>
                  ))}
                </div>
              </div>

              <div className="w-full border-t-2 border-dashed border-pink-50 mt-12 pt-10 text-center">
                <p className="text-lg text-gray-400 mb-2 font-medium">우리의 운명 점수는...</p>
                <h3 className="text-8xl font-black text-[#FF85A1] italic animate-bounce mb-10 drop-shadow-sm">{finalScore}%</h3>
                <button onClick={handleReset} className="px-12 py-4 bg-[#FFF9FA] text-[#FF85A1] font-bold rounded-2xl hover:bg-[#FF85A1] hover:text-white transition-all shadow-sm active:scale-95">다시 하기</button>
              </div>
            </div>
        )}
      </main>
  );
}