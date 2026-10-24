export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-white px-4 py-5 sm:px-8">
      <div className="flex flex-col gap-2 text-[12px] text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()}{" "}
          <strong className="font-semibold text-slate-800">
            BEVOX Analytics Studio
          </strong>{" "}
          • Adega Distribution Ltda.
        </p>
      </div>
    </footer>
  );
}
