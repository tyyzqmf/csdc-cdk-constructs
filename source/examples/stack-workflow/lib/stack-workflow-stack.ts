import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CSDCStackWorkflow } from '../../../patterns/@csdc-solutions-constructs/csdc-stack-workflow/lib/index';

export class StackWorkflowStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CSDCStackWorkflow(this, 'CSDCStackWorkflow', {});
  }
}
