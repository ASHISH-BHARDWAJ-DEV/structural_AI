#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, BytesN, Env, String, symbol_short, Symbol};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReportRecord {
    pub document_hash: BytesN<32>,
    pub cost_mid: u64,
    pub timestamp: u64,
}

const REPORT_KEY: Symbol = symbol_short!("REPORT");

#[contract]
pub struct ReportRegistry;

#[contractimpl]
impl ReportRegistry {
    /// Anchors a new report hash to the ledger for a specific project.
    /// Prevents overwriting if the project_id already exists.
    pub fn anchor_report(env: Env, project_id: String, document_hash: BytesN<32>, cost_mid: u64) {
        // Use project_id as part of the storage key to make it unique per project
        let key = (REPORT_KEY, project_id.clone());

        // Check if a record already exists for this project_id
        if env.storage().persistent().has(&key) {
            panic!("Report already exists for this project ID");
        }

        let record = ReportRecord {
            document_hash,
            cost_mid,
            timestamp: env.ledger().timestamp(),
        };

        // Save the record in persistent storage
        env.storage().persistent().set(&key, &record);
    }

    /// Retrieves a report record for a given project ID.
    pub fn verify_report(env: Env, project_id: String) -> Option<ReportRecord> {
        let key = (REPORT_KEY, project_id);
        env.storage().persistent().get(&key)
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Ledger, BytesN, Env, String};

    #[test]
    fn test_anchor_and_verify() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ReportRegistry);
        let client = ReportRegistryClient::new(&env, &contract_id);

        let project_id = String::from_str(&env, "project_123");
        let document_hash = BytesN::from_array(&env, &[1u8; 32]);
        let cost_mid = 5000;

        // Set a constant timestamp for the test
        env.ledger().set_timestamp(123456789);

        // Anchor the report
        client.anchor_report(&project_id, &document_hash, &cost_mid);

        // Verify the report
        let result = client.verify_report(&project_id);
        assert!(result.is_some());
        
        let record = result.unwrap();
        assert_eq!(record.document_hash, document_hash);
        assert_eq!(record.cost_mid, cost_mid);
        assert_eq!(record.timestamp, 123456789);
    }

    #[test]
    #[should_panic(expected = "Report already exists for this project ID")]
    fn test_prevent_overwrite() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ReportRegistry);
        let client = ReportRegistryClient::new(&env, &contract_id);

        let project_id = String::from_str(&env, "project_123");
        let document_hash = BytesN::from_array(&env, &[1u8; 32]);
        let cost_mid = 5000;

        client.anchor_report(&project_id, &document_hash, &cost_mid);
        
        // This second call should panic
        client.anchor_report(&project_id, &document_hash, &cost_mid);
    }
}
