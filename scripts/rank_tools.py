#!/usr/bin/env python3
"""
Reorders tools in each event's tool-ideas.md from most useful to least useful.

Strategy: parse each file into its header + ordered tool sections, then rewrite
the file with sections in a new order specified per event below.
"""

import os
import re
from pathlib import Path

BASE = Path("src/components/events")

# For each event, the desired tool order (most -> least useful).
# Names must match the exact `### Tool: <Name>` heading text in the file.
RANKINGS = {
    "anatomy": [
        "Disorder-Mechanism Drill",
        "Interactive Labeled-Diagram Quizzer",
        "Hormone Matrix Trainer",
        "Goldman-Hodgkin-Katz Equation Calculator",
        "Action Potential Phase Identifier",
        "Reflex Arc Tracer",
        "Pathway Tracer (Sight / Pupillary Reflex)",
        "Cranial Nerve Function & Assessment Tester",
        "EEG Waveform Identification Set",
        "Spinal Cord Tract Identifier",
        "Timed Mixed-Format Practice Test Generator",
        "Cheat Sheet Builder/Optimizer",
    ],
    "boomilever": [
        "Truss Efficiency Calculator/Simulator",
        "Testing Wall Geometry Visualizer",
        "Structure Mass vs. Load Ratio Tracker",
        "Failure Mode Diagnosis Guide",
        "Wood/Adhesive Strength Reference Tool",
        "Design Knowledge Q&A Trainer",
    ],
    "chemlab": [
        "Ion Nomenclature & Charge Drill",
        "Stoichiometry Problem Solver",
        "Reaction Type Classifier & Product Predictor",
        "Chemical Equation Balancer & Classifier",
        "Kinetics Rate Law Solver",
        "Solubility Rule Practice & Precipitation Predictor",
        "Oxidation State Assigner & Redox Half-Reaction Balancer",
        "Limiting Reagent Visualizer",
        "Reaction Condition Effect Explainer",
        "Lab Safety Compliance Checker",
        "Equipment & Procedure Reference Guide",
    ],
    "circuitlab": [
        "Ohm's Law & Power Multi-Variable Solver",
        "Kirchhoff's Law Circuit Analyzer",
        "Mystery Resistor Problem Solver",
        "Circuit Diagram Interpreter & Builder",
        "Multimeter Reading Simulator & Validator",
        "LED Brightness Equalizer Calculator",
        "Electromagnetic Force & Motion Calculator",
        "AC vs. DC & Transformer Conceptual Explainer",
        "Diode & Transistor Behavior Analyzer (State/National)",
        "Historical Figures Quick Reference & Quiz",
    ],
    "designergenes": [
        "Punnett Square Master (Mono-, Di-, Tri-Hybrid)",
        "Probability & Testcross Analyzer",
        "Pedigree Analyzer & Predictor",
        "Hardy-Weinberg Equilibrium Solver",
        "Gene Mapping & Recombination Calculator",
        "Phylogenetic Tree Interpreter & Builder",
        "Mutation Type & Protein Consequence Predictor",
        "Lac & Trp Operon Regulator Simulator",
        "DNA Replication Scenario Tracer",
        "Heritability Calculator & Realized Heritability Estimator",
        "PCR, Sequencing & Molecular Cloning Technique Matcher",
        "State/National Advanced Topics Reference (Heritability, Protein Secretion, ChIP-seq)",
    ],
    "dynamicplanet": [
        "Ocean Circulation Simulator & Visualizer",
        "Thermocline & Density Profile Analyzer",
        "Wave Property Calculator",
        "Tidal Pattern Predictor & Analyzer",
        "Coriolis Effect Visualizer",
        "Geostrophic Current Calculator",
        "Rossby & Kelvin Wave Identifier",
        "ENSO Phase Analyzer & Predictor",
        "Bathymetric Profile & Ocean Floor Feature Identifier",
        "Coastal Upwelling & Downwelling Predictor",
        "Estuarine Circulation & Mixing Analyzer",
        "Estuarine & Coastal Landform Identifier",
        "Oceanic Sediment & Turbidite Identifier",
        "Coral Reef & Atoll Formation Simulator",
        "Ocean Acidification & Climate Change Impact Calculator",
    ],
    "electricvehicle": [
        "Racetrack Course Analyzer & Performance Predictor",
        "Battery State-of-Charge Tracker",
        "Range & Efficiency Calculator",
        "Energy Consumption Tracker & Optimizer",
        "Motor Power & Torque Calculator",
        "Motor Efficiency Optimization Guide",
        "Speed & Acceleration Performance Predictor",
        "Weight vs. Performance Tradeoff Analyzer",
    ],
    "entomology": [
        "Specimen Visual Identifier (Flash Card Mode)",
        "Dichotomous Key Generator & Practice",
        "Adult & Larval/Nymph Form Matcher",
        "Taxonomy Hierarchizer & Lookup",
        "Mouthpart Type Identifier",
        "Wing Morphology & Modification Identifier",
        "Metamorphosis Type Practice",
        "Anatomy Label & Feature Recognition Tool",
        "Ecology & Habitat Matcher",
        "Economic Importance Categorizer",
        "Integrated Pest Management (IPM) Strategy Designer",
        "Behavioral Characteristic Matcher",
    ],
    "machines": [
        "Lever Equilibrium Problem Solver",
        "Static Equilibrium Force & Torque Analyzer",
        "Mechanical Advantage Calculator",
        "Compound Machine Analyzer",
        "Work, Power & Energy Calculator",
        "Pulley System Analyzer (Fixed, Movable, Block & Tackle)",
        "Wheel-and-Axle & Gear System Analyzer",
        "Angle of Repose & Self-Locking Calculator",
        "Efficiency Analysis for Friction Losses",
        "Simple Machine Type Identifier & Classifier",
        "Device Testing Mass Ratio Simulator",
        "Device Design & Compliance Checker",
        "State/National Advanced Topics (Non-Equilibrium Dynamics)",
    ],
    "metricmastery": [
        "Metric Unit Conversion Sprint",
        "Estimation Calibration Trainer",
        "Measurement Precision Formatter & Validator",
        "Density, Area & Volume Calculator with Precision",
        "Force & Spring Constant Calculator",
        "Mechanical Energy (Gravitational PE, Kinetic Energy) Calculator",
        "Significant Figures Calculator",
        "Precision Loss Analyzer (Compounding Errors)",
        "Station-Time Management Simulator",
    ],
    "rocksandminerals": [
        "Mineral Properties Identifier",
        "Rock Classifier (Igneous/Sedimentary/Metamorphic)",
        "Feldspar Ternary Diagram Analyzer",
        "Phase Diagram Interpreter (T-P and T-Composition)",
        "Bowen's Reaction Series Simulator",
        "Metamorphic Facies & Grade Identifier",
        "Protolith Predictor",
        "Formation Environment Matcher",
        "Sedimentary Depositional Environment Identifier",
        "Sedimentary Structure Identifier",
        "Crystal System Matcher (State/National)",
        "Thin Section Analyzer (State/National)",
        "Economic & Industrial Use Matcher",
    ],
    "writeitdoit": [
        "Description Quality Analyzer & Drawing-Rule Validator",
        "Instruction Sequencing Validator",
        "Piece Naming Consistency Checker",
        "Spatial Descriptor Vocabulary Builder",
        "Color & Orientation Explicit Reminder",
        "Description Structure Analyzer & Scaffolder",
        "Description Completeness Checker (Piece-by-Piece)",
        "Writer Time-Allocation Coach",
        "Practice Object Library",
        "Builder Phase Practice (20-Minute Reconstruction)",
        "Builder Feedback Simulator",
        "Competition Simulation (Full Event Mock)",
        "Peer Review & Collaborative Editing",
    ],
}


def split_into_sections(text):
    """Split file into (header, [(tool_name, tool_section_text), ...])."""
    pattern = re.compile(r"^### Tool: (.+?)$", re.MULTILINE)
    matches = list(pattern.finditer(text))

    if not matches:
        return text, []

    # Header is everything up to the first tool heading, stripped of trailing dividers/whitespace.
    header = text[: matches[0].start()].rstrip()
    # If header ends with a divider, drop it (we'll add fresh dividers between tools).
    header = re.sub(r"\n---\s*$", "", header) + "\n"

    sections = []
    for i, m in enumerate(matches):
        name = m.group(1).strip()
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        # Strip section text of trailing dividers/whitespace, will add fresh ones between tools.
        section_text = text[start:end].rstrip()
        section_text = re.sub(r"\n---\s*$", "", section_text)
        sections.append((name, section_text))

    return header, sections


def reorder_file(path, desired_order):
    """Rewrite a single tool-ideas.md file with tools in desired order."""
    text = path.read_text(encoding="utf-8")
    header, sections = split_into_sections(text)

    by_name = {name: sec for name, sec in sections}
    seen = set()
    ordered_sections = []

    for name in desired_order:
        if name not in by_name:
            print(f"  [WARN] Missing tool '{name}' in {path}")
            continue
        ordered_sections.append(by_name[name])
        seen.add(name)

    extras = [(n, s) for n, s in sections if n not in seen]
    if extras:
        print(f"  [WARN] Unranked tools in {path}: {[n for n, _ in extras]}")
        ordered_sections.extend(s for _, s in extras)

    parts = [header]
    for i, sec in enumerate(ordered_sections):
        parts.append(sec)
        if i < len(ordered_sections) - 1:
            parts.append("\n---\n")
    parts.append("")
    path.write_text("\n".join(parts), encoding="utf-8")


def main():
    for event, ranking in RANKINGS.items():
        path = BASE / event / "tool-ideas.md"
        if not path.exists():
            print(f"[SKIP] {path} not found")
            continue
        print(f"[OK]   Reordering {event} ({len(ranking)} tools)")
        reorder_file(path, ranking)
    print("Done.")


if __name__ == "__main__":
    main()
