export default function Loading() {
  return (
    <div className="fixed left-0 right-0 top-0 z-[100000000] h-[10px] overflow-hidden bg-[#efefd0]">
      <div className="h-full w-1/3 animate-loading-bar rounded-r-full bg-[#004e89]" />
    </div>
  );
}
