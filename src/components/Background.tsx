// The backgrounds are 16:9 with the artwork in the top-right corner, like the game's menus
export default function Background({ name }: { name: string }) {
  return (
    <div aria-hidden class="pointer-events-none absolute inset-0 hidden md:block">
      <img
        key={name}
        src={`images/${name}.webp`}
        alt=""
        class="h-full w-full object-cover object-right-top animate-[fadeIn_400ms_ease-out]"
      />
    </div>
  );
}
