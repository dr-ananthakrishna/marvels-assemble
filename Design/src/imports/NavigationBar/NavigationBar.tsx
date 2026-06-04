import svgPaths from "./svg-jk5vuehtyk";

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-full">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="main-icons">
        <div className="absolute inset-[8.33%_8.33%_8.33%_12.5%]" data-name="home">
          <div className="absolute inset-[2.73%_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.8333 16.212">
              <path clipRule="evenodd" d={svgPaths.pe868400} fill="var(--fill-0, #62C8DF)" fillRule="evenodd" id="home" />
            </svg>
          </div>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Medium',sans-serif] font-medium leading-[12px] relative shrink-0 text-[#62c8df] text-[10px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Home
      </p>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-full">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="main-icons">
        <div className="absolute inset-[12.5%_16.67%_12.5%_12.5%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.1667 15">
            <g id="Vector">
              <path clipRule="evenodd" d={svgPaths.p251374f0} fill="var(--fill-0, #959A9B)" fillRule="evenodd" />
              <path d={svgPaths.p2d7a1680} fill="var(--fill-0, #959A9B)" />
            </g>
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Medium',sans-serif] font-medium leading-[12px] relative shrink-0 text-[#959a9b] text-[10px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        QBank
      </p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-full">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="main-icons">
        <div className="absolute inset-[12.5%_20.83%]" data-name="Subtract">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.6667 15">
            <path clipRule="evenodd" d={svgPaths.p2cce0280} fill="var(--fill-0, #959A9B)" fillRule="evenodd" id="Subtract" />
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Medium',sans-serif] font-medium leading-[12px] relative shrink-0 text-[#959a9b] text-[10px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Tests
      </p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="content-stretch flex flex-col gap-[6px] items-center relative shrink-0 w-full">
      <div className="overflow-clip relative shrink-0 size-[20px]" data-name="main-icons">
        <div className="absolute inset-[12.5%_8.33%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.6667 15">
            <g id="Vector">
              <path d={svgPaths.pe646680} fill="var(--fill-0, #959A9B)" />
              <path d={svgPaths.pe4ebd80} fill="var(--fill-0, #959A9B)" />
              <path d={svgPaths.p33e66100} fill="var(--fill-0, #959A9B)" />
              <path d={svgPaths.p3943a600} fill="var(--fill-0, #959A9B)" />
            </g>
          </svg>
        </div>
      </div>
      <p className="[word-break:break-word] font-['Roboto:Medium',sans-serif] font-medium leading-[12px] relative shrink-0 text-[#959a9b] text-[10px] text-center whitespace-nowrap" style={{ fontVariationSettings: '"wdth" 100' }}>
        Videos
      </p>
    </div>
  );
}

export default function NavigationBar() {
  return (
    <div className="bg-[#f5f5f5] relative size-full" data-name="navigation-bar">
      <div className="content-stretch flex gap-[4px] items-center justify-center px-[16px] relative size-full">
        <div className="flex-[1_0_0] h-[56px] min-w-px relative" data-name="bottom-item">
          <div className="flex flex-col items-center justify-end size-full">
            <div className="content-stretch flex flex-col gap-[6px] items-center justify-end px-[7px] relative size-full">
              <Frame />
              <div className="flex items-center justify-center relative shrink-0 w-full">
                <div className="-scale-y-100 flex-none w-full">
                  <div className="bg-[#62c8df] h-[4px] relative rounded-bl-[2px] rounded-br-[2px] w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-[1_0_0] h-[56px] min-w-px relative" data-name="bottom-item">
          <div className="flex flex-col items-center size-full">
            <div className="content-stretch flex flex-col items-center px-[7px] py-[8px] relative size-full">
              <Frame1 />
            </div>
          </div>
        </div>
        <div className="flex-[1_0_0] h-[56px] min-w-px relative" data-name="bottom-item">
          <div className="flex flex-col items-center size-full">
            <div className="content-stretch flex flex-col items-center px-[7px] py-[8px] relative size-full">
              <Frame2 />
            </div>
          </div>
        </div>
        <div className="flex-[1_0_0] h-[56px] min-w-px relative" data-name="bottom-item">
          <div className="flex flex-col items-center size-full">
            <div className="content-stretch flex flex-col items-center px-[7px] py-[8px] relative size-full">
              <Frame3 />
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="absolute border-[rgba(255,255,255,0)] border-solid border-t inset-0 pointer-events-none shadow-[2px_1px_8px_0px_rgba(0,0,0,0.18)]" />
    </div>
  );
}