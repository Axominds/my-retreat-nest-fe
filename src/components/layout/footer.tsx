export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-lg font-bold">My Retreat Nest</span>
            <p className="text-sm text-muted-foreground mt-1">
              Discover your perfect retreat.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} My Retreat Nest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
