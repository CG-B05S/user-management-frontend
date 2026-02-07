export default function Footer() {
  return (
    <footer className="footer footer-center bg-base-100 py-4 absolute bottom-0 w-full text-sm text-base-content/60">

      <aside className="text-sm opacity-70">
        <p>
          © {new Date().getFullYear()} User Management by{" "}
          <span className="font-semibold text-primary">
            CG
          </span>
        </p>
      </aside>

    </footer>
  );
}
