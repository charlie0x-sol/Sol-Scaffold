import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Command } from 'commander';

// Define mocks
const mockGetTemplateDir = jest.fn();
const mockCopyTemplate = jest.fn();
const mockCustomizeTemplate = jest.fn();
const mockInstallDependencies = jest.fn();
const mockReaddir = jest.fn();
const mockExistsSync = jest.fn();
const mockPrompt = jest.fn();

// Register mocks BEFORE importing the module under test
jest.unstable_mockModule('../../src/utils/files.js', () => ({
  copyTemplate: mockCopyTemplate,
  customizeTemplate: mockCustomizeTemplate,
  installDependencies: mockInstallDependencies,
}));

jest.unstable_mockModule('../../src/utils/paths.js', () => ({
  getTemplateDir: mockGetTemplateDir,
}));

jest.unstable_mockModule('fs-extra', () => ({
  default: {
    readdir: mockReaddir,
    existsSync: mockExistsSync,
  },
  readdir: mockReaddir,
  existsSync: mockExistsSync,
}));

jest.unstable_mockModule('inquirer', () => ({
  default: {
    prompt: mockPrompt,
  },
  prompt: mockPrompt,
}));

// Import the module under test dynamically
const { newCommand } = await import('../../src/commands/new.js');

describe('new command', () => {
  let program: Command;

  beforeEach(() => {
    program = new Command();
    program.addCommand(newCommand);
    jest.clearAllMocks();
    
    // Default mock implementations
    mockGetTemplateDir.mockReturnValue('/templates');
    mockReaddir.mockResolvedValue(['swap', 'lending', 'staking']);
    mockExistsSync.mockReturnValue(false);
  });

  it('should verify primitive and name via arguments', async () => {
    await program.parseAsync(['node', 'sol-scaffold', 'new', 'swap', 'my-project']);

    expect(mockGetTemplateDir).toHaveBeenCalled();
    expect(mockReaddir).toHaveBeenCalledWith('/templates');
    expect(mockPrompt).not.toHaveBeenCalled();
    expect(mockCopyTemplate).toHaveBeenCalledWith('/templates/swap', expect.stringContaining('my-project'));
    expect(mockCustomizeTemplate).toHaveBeenCalled();
    expect(mockInstallDependencies).toHaveBeenCalled();
  });

  it('should prompt for primitive and name if both are missing', async () => {
    mockPrompt
      .mockResolvedValueOnce({ primitive: 'lending' })
      .mockResolvedValueOnce({ name: 'my-lending-dapp' });

    await program.parseAsync(['node', 'sol-scaffold', 'new']);

    expect(mockPrompt).toHaveBeenCalledTimes(2);
    expect(mockPrompt).toHaveBeenNthCalledWith(1, expect.arrayContaining([
      expect.objectContaining({ name: 'primitive', type: 'list' })
    ]));
    expect(mockPrompt).toHaveBeenNthCalledWith(2, expect.arrayContaining([
      expect.objectContaining({ name: 'name', type: 'input' })
    ]));
    expect(mockCopyTemplate).toHaveBeenCalledWith('/templates/lending', expect.stringContaining('my-lending-dapp'));
  });
    
  it('should prompt for name if only primitive is provided', async () => {
     mockPrompt.mockResolvedValueOnce({ name: 'interactive-project' });
 
     await program.parseAsync(['node', 'sol-scaffold', 'new', 'swap']);
 
     expect(mockPrompt).toHaveBeenCalledWith(expect.arrayContaining([
       expect.objectContaining({ name: 'name', type: 'input' })
     ]));
     expect(mockCopyTemplate).toHaveBeenCalledWith('/templates/swap', expect.stringContaining('interactive-project'));
   });

  it('should fail if primitive does not exist', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await program.parseAsync(['node', 'sol-scaffold', 'new', 'invalid-primitive', 'my-project']);

    expect(mockCopyTemplate).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Template \'invalid-primitive\' not found'));
    
    consoleSpy.mockRestore();
  });

  it('should fail if destination directory already exists', async () => {
     mockExistsSync.mockReturnValue(true);
     const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
 
     await program.parseAsync(['node', 'sol-scaffold', 'new', 'swap', 'existing-project']);
 
     expect(mockCopyTemplate).not.toHaveBeenCalled();
     expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already exists'));
 
     consoleSpy.mockRestore();
   });
});