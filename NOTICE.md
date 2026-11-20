# Notices: standards, trademarks, fonts

## Standards text

C-V2X Uu Quest teaches material specified by 3GPP (Releases 14–18) and refers to IEEE 1609.2, SAE J2735 and
ETSI ITS messages. **It reproduces no text, figures or tables from those documents.** All explanations,
diagrams, questions and glossary entries were written for this project. The game uses facts from the
specifications (parameter values, procedure order, interface names, QoS class values, timing rules) and cites
the specification and clause where each topic is defined, so learners can read the source.

Specifications are copyright of their publishers: 3GPP specifications © the 3GPP Organizational Partners
(ARIB, ATIS, CCSA, ETSI, TSDSI, TTA, TTC); IEEE standards © IEEE; SAE standards © SAE International;
ETSI deliverables © ETSI. Free copies of 3GPP specifications are available at <https://www.3gpp.org/specifications>.

### How this was checked

Before publication (November 2026) the complete teaching text of the game, about 24,000 words extracted from
the game data, was compared word by word against the current versions of the 18 3GPP specifications it draws
on: TS 22.185, 22.186, 23.203, 23.246, 23.285, 23.287, 23.401, 23.501, 33.185, 33.401, 36.211, 36.213,
36.300, 36.304, 36.321, 36.331, 38.211 and 38.300 (about 14 MB of text).

- No run of 8 or more consecutive words is shared, apart from a row of subframe numbers (0 1 2 3 …) in a
  timing diagram. Three 8-word technical phrases found by the first scan were reworded anyway.
- Shared runs of 6–7 words are ordinary technical phrases, such as "the S-GW and P-GW" or "subframes 0 and 5".
- IEEE 1609.2, SAE J2735 and the ETSI CAM/DENM are mentioned by name and summarised in a few original sentences.

The check can be repeated by anyone with free copies of the specifications from 3gpp.org.

## Trademarks

3GPP™ and LTE™ are trademarks of ETSI registered for the benefit of the 3GPP Organizational Partners.
IEEE is a trademark of the Institute of Electrical and Electronics Engineers; SAE is a trademark of SAE
International. These names are used only to identify the technologies being taught. This project is not
affiliated with, sponsored by or endorsed by any of these organisations.

The highway-sign look is an original design in the general style of road guide signs; it does not use the
Interstate shield or any other protected route marker.

## Fonts

Loaded at run time from Google Fonts (not redistributed in this repository), all under the
[SIL Open Font License 1.1](https://openfontlicense.org):

- Overpass and Overpass Mono, by Delve Withrington, Dave Bailey and Thomas Jockin
- Atkinson Hyperlegible, by the Braille Institute of America

## Teaching models

The latency lab, broadcast cost model and handover simulator use simplified numbers chosen to show the real
trade-offs (for example the n+4 grant timing, the 8 ms HARQ round trip, the 3GPP macro-cell path-loss formula
128.1 + 37.6 log10(d km)). They are not measurements of any particular network.
