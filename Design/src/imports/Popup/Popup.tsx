function Frame() {
  return (
    <div className="[word-break:break-word] content-stretch flex flex-col gap-[10px] items-center leading-[0] relative shrink-0 text-center w-full">
      <div className="flex flex-col font-['Roboto:Bold',sans-serif] font-bold justify-center relative shrink-0 text-[#626768] text-[20px] w-full" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[24px]">Stay Tuned</p>
      </div>
      <div className="flex flex-col font-['Roboto:Regular',sans-serif] font-normal justify-center relative shrink-0 text-[#7b8182] text-[14px] w-full whitespace-pre-wrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        <p className="leading-[17px] mb-[6px]">{`This video will be LIVE in `}</p>
        <p className="leading-[17px]">{`00:02:12 `}</p>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[8px] items-center relative shrink-0 w-full">
      <div className="content-stretch flex gap-[10px] h-[40px] items-center justify-center p-[8px] relative rounded-[4px] shrink-0 w-[200px]" data-name="button">
        <div aria-hidden className="absolute bg-[#62c8df] inset-0 pointer-events-none rounded-[4px]" />
        <div className="[word-break:break-word] flex flex-col font-['Roboto:Bold',sans-serif] font-bold justify-center leading-[0] relative shrink-0 text-[14px] text-white tracking-[0.5px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[17px]">NOTIFY ME</p>
        </div>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-2px_3px_0px_rgba(0,0,0,0.2)]" />
      </div>
      <div className="content-stretch flex gap-[10px] h-[40px] items-center justify-center p-[8px] relative rounded-[4px] shrink-0 w-[200px]" data-name="button">
        <div className="[word-break:break-word] flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#4a69a2] text-[14px] whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
          <p className="leading-[17px]">Cancel</p>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[28px] items-center relative shrink-0 w-full">
      <Frame />
      <Frame2 />
    </div>
  );
}

export default function Popup() {
  return (
    <div className="bg-white content-stretch drop-shadow-[2px_1px_4px_rgba(0,0,0,0.18)] flex flex-col items-center px-[24px] py-[28px] relative rounded-[4px] size-full" data-name="popup">
      <Frame1 />
    </div>
  );
}