import { CSDCStackWorkflow } from '../../../patterns/@csdc-solutions-constructs/stack-workflow/lib/index';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class StackWorkflowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CSDCStackWorkflow(this, 'Workflow', {});
  }
}
