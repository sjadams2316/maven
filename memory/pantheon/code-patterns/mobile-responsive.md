# Mobile Responsive Patterns

## Touch Targets (48px minimum)

```tsx
// For buttons
<button className="min-h-[48px] min-w-[48px] p-3">
  Click me
</button>

// For links
<Link className="inline-flex items-center min-h-[48px] px-4">
  Navigate
</Link>

// For icon buttons
<button className="w-12 h-12 flex items-center justify-center">
  <Icon className="w-6 h-6" />
</button>
```

---

## Responsive Grids (Mobile-First)

```tsx
// 1 col mobile → 2 col tablet → 3 col desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>

// 1 col mobile → 3 col desktop (skip tablet breakpoint)
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {items.map(item => <Card key={item.id} />)}
</div>
```

---

## Horizontal Scrolling Tabs

```tsx
// In globals.css:
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

// Component:
<div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
  {tabs.map(tab => (
    <button 
      key={tab.id}
      className="min-w-[48px] px-4 py-3 whitespace-nowrap"
    >
      {tab.label}
    </button>
  ))}
</div>
```

---

## Responsive Text

```tsx
// Headings
<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
  Title
</h1>

// Body text
<p className="text-sm sm:text-base">
  Content
</p>

// Small/caption text
<span className="text-xs sm:text-sm text-gray-500">
  Caption
</span>
```

---

## Mobile-Friendly Modals/Tooltips

```tsx
// Fixed to bottom on mobile, positioned on desktop
<div className={`
  fixed inset-x-4 bottom-4 
  sm:absolute sm:inset-auto sm:bottom-full sm:left-0 sm:mb-2
  bg-gray-900 rounded-lg p-4 shadow-xl
`}>
  {content}
</div>
```

---

## Stacking Layout Pattern

```tsx
// Side-by-side on desktop, stacked on mobile
<div className="flex flex-col sm:flex-row gap-4">
  <div className="flex-1">{left}</div>
  <div className="flex-1">{right}</div>
</div>
```
