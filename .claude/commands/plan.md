# Plan Command

Create an implementation plan for a feature or change in the Reset Sizes extension.

## Input

$ARGUMENTS - Description of the feature or change to plan

## Instructions

1. **Understand the Request**
   - Parse the feature/change description
   - Identify the scope (new feature, bug fix, enhancement, refactor)

2. **Analyze Impact**
   - List which modules will be affected (see docs/ai/ownership.md)
   - Identify dependencies between changes
   - Note any breaking changes

3. **Create File-Level Plan**
   For each file that needs changes:
   - File path
   - What changes are needed
   - Order of changes (dependencies)

4. **Identify Risks**
   - What could go wrong?
   - What needs careful testing?

5. **Output Format**

```markdown
## Plan: [Feature Name]

### Summary
[1-2 sentence description]

### Scope
- Type: [new feature | bug fix | enhancement | refactor]
- Complexity: [small | medium | large]

### Files to Modify

#### 1. [file path]
- [ ] Change 1
- [ ] Change 2

#### 2. [file path]
- [ ] Change 1

### New Files (if any)
- [file path] - [purpose]

### Tests Required
- [ ] Test case 1
- [ ] Test case 2

### Documentation Updates
- [ ] README.md (if user-facing)
- [ ] TESTING.md (if test scenarios change)
- [ ] docs/ai/*.md (if architecture changes)

### Risks & Considerations
- [Risk 1]
- [Risk 2]

### Implementation Order
1. [First step]
2. [Second step]
3. ...
```

## Example

Input: "Add a verbose logging option"

Output:
```markdown
## Plan: Verbose Logging Option

### Summary
Add a `resetSizes.verbose` configuration option to control logging detail level.

### Scope
- Type: enhancement
- Complexity: small

### Files to Modify

#### 1. package.json
- [ ] Add `resetSizes.verbose` boolean property to configuration schema

#### 2. src/types/index.ts
- [ ] Add `verbose: boolean` to ExtensionConfig interface

#### 3. src/utils/index.ts
- [ ] Update getExtensionConfig() to read verbose setting
- [ ] Modify logging functions to check verbose flag

#### 4. src/commands/resetAllSizes.ts
- [ ] Pass verbose flag to logging calls
- [ ] Add detailed logs when verbose is true

### Tests Required
- [ ] Test getExtensionConfig reads verbose setting
- [ ] Test verbose=true produces more output
- [ ] Test verbose=false (default) maintains current behavior

### Documentation Updates
- [ ] README.md - Document new option
- [ ] docs/ai/ownership.md - If new patterns established

### Risks & Considerations
- Ensure default (false) maintains backward compatibility
- Don't log sensitive information even in verbose mode

### Implementation Order
1. Add type definition
2. Add configuration schema
3. Update config loading
4. Add verbose logging logic
5. Write tests
6. Update documentation
```
