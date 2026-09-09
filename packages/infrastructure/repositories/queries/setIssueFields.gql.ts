export default `mutation SetIssueFields($issueId: ID!, $issueFields: [IssueFieldCreateOrUpdateInput!]!) {
  setIssueFieldValue(input: {issueId: $issueId, issueFields: $issueFields}) {
    issue { id }
  }
}`
