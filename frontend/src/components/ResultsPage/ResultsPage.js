import React from 'react';
import { Card, Row, Col } from 'antd';

export const ResultsPage = () => (
    <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
        <Col span={12}>
            <Card title='Risk Meter'>
                {'Risk Meter Content'}
            </Card>
        </Col>
        <Col span={12}>
            <Card title='Info'/>
            <br/>
            <Card title='More Info'/>
        </Col>
    </Row>
)