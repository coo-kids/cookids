curl 'https://api.github.com/graphql' \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"query":"query($login: String!) { organization(login: $login) { issueFields(first: 100) { nodes { ... on Node { id } ... on IssueFieldCommon { name dataType } ... on IssueFieldSingleSelect { options { id name } } ... on IssueFieldMultiSelect { options { id name } } } pageInfo { hasNextPage endCursor } } } }","variables":{"login":"coo-kids"}}'