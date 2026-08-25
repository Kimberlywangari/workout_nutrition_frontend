interface DateFilterProps {
  selectedDate: string;       
  onChange: (date: string) => void; 

}

// This component holds NO state of its own — it just displays what it's told (selectedDate)
// and reports changes upward (onChange). This pattern is called a "controlled component."
export function DateFilter({ selectedDate, onChange }: DateFilterProps) {
  return (
    <div>
      <label htmlFor="date-filter">Filter by date: </label>
      <input
        id="date-filter"
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
      />
      {selectedDate && (
        <button onClick={() => onChange("")}>Clear</button>
      )}
    </div>
  );
}