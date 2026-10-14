import { ToolHeader } from '../../general/ui/primitives';

const requirements = [
  'The vehicle travels for a set time, pushes a water bottle past a line, then reverses to stop near the Target Point.',
  'Electrical energy comes from at most eight AA batteries; lithium/lead batteries and energy storage beyond battery output are prohibited.',
  'Maximum dimensions: 80.0 cm long and 35.0 cm wide. A fixed, rigid Bottle Pusher leads the vehicle; the rear Measurement Point is the vehicle’s rearmost part.',
  'One vehicle is impounded. Teams receive up to 8 minutes of Event Time and up to two runs.',
  'The Event Supervisor announces Target Distance, Target Time, and Bottle Line Distance after impound; values are shared by teams at that competition.'
];

export default function ArcVisualizer() {
  return (
    <ToolHeader
      eyebrow="Verified 2027 event overview"
      title="Electric Vehicle C"
      purpose="Teams design and build an electrically propelled vehicle that pushes a water bottle past a line, then moves backward and stops close to a Target Point. The summary below is verified against the 2027 manual."
      manualReference="2027 Division C Rules Manual, pp. C26–C31"
      style={{ maxWidth: 760, padding: 20 }}
    >
      <ul style={{ display: 'grid', gap: 10, paddingLeft: 22, margin: 0 }}>
        {requirements.map((item) => (
          <li key={item} style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.6 }}>{item}</li>
        ))}
      </ul>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 12 }}>
        <a href="https://www.soinc.org/electric-vehicle-c" target="_blank" rel="noreferrer">Official EV event page</a>
        <a href="https://www.soinc.org/rules-2027" target="_blank" rel="noreferrer">2027 rules</a>
        <a href="https://www.soinc.org/events/rules-clarifications" target="_blank" rel="noreferrer">Rule corrections</a>
        <a href="https://www.soinc.org/faq/electric-vehicle-div-c" target="_blank" rel="noreferrer">EV clarifications</a>
      </div>
    </ToolHeader>
  );
}
