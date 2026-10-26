export function artifactAuthority(d,reviewId,p,kind){const latest=d.versions.at(-1)||null,selected=d.versions.find(v=>v.id===reviewId)||latest,approved=d.versions.find(v=>v.id===d.approvedVersion)||null;return {latest,selected,approved,packageVersion:p?.[kind==='cv'?'cvVersion':'coverLetterVersion']??null};}

export function generationPrerequisiteMessage(a){const clarification=!a.clarifications.sap,language=!a.outputLanguage;if(clarification&&language)return 'Resolve the clarification and commit an application language to generate.';if(language)return 'Commit an application language to generate.';if(clarification)return 'Resolve the clarification to generate.';return '';}
// Bounded English display adapter for the controlled accepted interpretation.
// Other source identities/revisions or unrecognised values produce no label.
const conditionSource={id:'TAVERA-VACANCY-v1.0-ADVERTISEMENT',version:'1.0',sha256:'74fa14de9c335bf923236ee96e597d44aff242c7ddf7c444e49f430805bff29b'};
function acceptedCondition(vacancy,id){const field=vacancy.structured?.find(x=>x.field_id===id),source=field?.source;if(field?.state!=='employer-stated'||source?.id!==conditionSource.id||source.version!==conditionSource.version||source.runtime_sha256!==conditionSource.sha256||typeof field.expected_value!=='string'||field.expected_value!==source.exact_span)return null;return field.expected_value.replace(/^\*\*[^*]+\*\*\s*/,'').trim();}
export function vacancyConditions(vacancy){const labels=[];
 const location=acceptedCondition(vacancy,'location.header')?.match(/^([^()]+)\s+\([^()]+\)$/u);if(location)labels.push(location[1].trim());
 const employment=acceptedCondition(vacancy,'condition.employment')?.match(/^unbefristet, Vollzeit \((\d+(?:[.,]\d+)?) Stunden pro Woche\)$/u);if(employment)labels.push('Permanent',employment[1]+' hours');
 const hybrid=acceptedCondition(vacancy,'condition.hybrid_model')?.match(/^hybrid, in der Regel (\S+) Tage pro Woche vor Ort und bis zu (\S+) Tage mobiles Arbeiten$/u),days={zwei:2,drei:3};if(hybrid&&days[hybrid[1]]&&days[hybrid[2]])labels.push('Hybrid, usually '+days[hybrid[1]]+' days on-site');
 const travel=acceptedCondition(vacancy,'condition.travel')?.match(/\bim Umfang von ca\. (\d+(?:[.,]\d+)?) %$/u);if(travel)labels.push('Travel approx. '+travel[1]+'%');
 return labels;
}
