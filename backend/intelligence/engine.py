import oracledb
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.linear_model import LinearRegression
import datetime
import uuid
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database credentials
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_CONNECT_STRING = os.getenv('DB_CONNECT_STRING')

def get_connection():
    try:
        return oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_CONNECT_STRING)
    except Exception as e:
        print(f"Error connecting to Oracle: {e}")
        return None

def fetch_data(conn, query):
    return pd.read_sql(query, conn)

def run_intelligence():
    print(f"[{datetime.datetime.now()}] Starting Intelligence Engine...")
    
    conn = get_connection()
    if not conn:
        return

    try:
        # 1. Fetch Latest Data
        users_df = fetch_data(conn, "SELECT * FROM USERS")
        orders_df = fetch_data(conn, "SELECT * FROM ORDERS")
        
        # If no data, use mock data for demonstration
        if users_df.empty or orders_df.empty:
            print("Database is empty. Using synthetic data for demonstration...")
            users_df = pd.DataFrame({
                'ID': [str(uuid.uuid4()) for _ in range(100)],
                'CREATED_AT': [datetime.datetime.now() - datetime.timedelta(days=x) for x in range(100)]
            })
            orders_df = pd.DataFrame({
                'ID': [str(uuid.uuid4()) for _ in range(200)],
                'USER_ID': [users_df['ID'].iloc[np.random.randint(0, 100)] for _ in range(200)],
                'AMOUNT': np.random.randint(50, 500, 200),
                'CREATED_AT': [datetime.datetime.now() - datetime.timedelta(days=np.random.randint(0, 30)) for _ in range(200)]
            })

        # 2. Basic KPI Calculations
        total_users = len(users_df)
        total_orders = len(orders_df)
        total_revenue = float(orders_df['AMOUNT'].sum())
        
        # Conversion Rate
        conversion_rate = (orders_df['USER_ID'].nunique() / total_users) * 100 if total_users > 0 else 0
        
        # 3. AI/ML: Sales Prediction (Linear Regression)
        orders_df['date'] = pd.to_datetime(orders_df['CREATED_AT']).dt.date
        daily_sales = orders_df.groupby('date')['AMOUNT'].sum().reset_index()
        daily_sales['day_index'] = np.arange(len(daily_sales))
        
        if len(daily_sales) > 1:
            X = daily_sales[['day_index']]
            y = daily_sales['AMOUNT']
            model = LinearRegression()
            model.fit(X, y)
            next_day_index = len(daily_sales)
            predicted_sales = float(model.predict([[next_day_index]])[0])
        else:
            predicted_sales = 0

        # 4. AI/ML: Anomaly Detection (Isolation Forest)
        iso_forest = IsolationForest(contamination=0.05)
        if not daily_sales.empty:
            daily_sales['anomaly'] = iso_forest.fit_predict(daily_sales[['AMOUNT']])
            anomalies = daily_sales[daily_sales['anomaly'] == -1]
            anomalies_list = [str(d) for d in anomalies['date'].tolist()]
        else:
            anomalies_list = []

        # 5. AI/ML: Churn Prediction (Simplified Random Forest)
        # We classify churn as users with no orders in the last 7 days
        cutoff = datetime.datetime.now() - datetime.timedelta(days=7)
        active_users = orders_df[pd.to_datetime(orders_df['CREATED_AT']) > cutoff]['USER_ID'].unique()
        users_df['churn'] = users_df['ID'].apply(lambda x: 1 if x not in active_users else 0)
        
        # Mock feature for training: days since join
        users_df['days_since_join'] = (datetime.datetime.now() - pd.to_datetime(users_df['CREATED_AT'])).dt.days
        X_churn = users_df[['days_since_join']]
        y_churn = users_df['churn']
        
        if len(users_df) > 5:
            clf = RandomForestClassifier()
            clf.fit(X_churn, y_churn)
            churn_rate = float(clf.predict_proba(X_churn)[:, 1].mean() * 100)
        else:
            churn_rate = 0

        # 6. Store Results in Oracle
        report_id = str(uuid.uuid4())
        cursor = conn.cursor()
        
        sql = """
            INSERT INTO ANALYTICS_REPORTS (
                ID, TOTAL_USERS, TOTAL_ORDERS, REVENUE, PREDICTED_SALES, 
                CHURN_RATE, ANOMALIES_DETECTED, CONVERSION_RATE
            ) VALUES (
                :1, :2, :3, :4, :5, :6, :7, :8
            )
        """
        
        cursor.execute(sql, (
            report_id, total_users, total_orders, total_revenue, predicted_sales,
            churn_rate, json.dumps(anomalies_list), conversion_rate
        ))
        
        conn.commit()
        print(f"[{datetime.datetime.now()}] Analytics Report Generated: {report_id}")

    except Exception as e:
        print(f"Error during intelligence run: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    run_intelligence()
